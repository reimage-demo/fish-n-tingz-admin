import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { anyApi as api } from "convex/server";
const publicSite =
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://127.0.0.1:4183/";
const imageUrl = (path) =>
  new URL(path, publicSite.endsWith("/") ? publicSite : publicSite + "/").href;
function Login({ onLogin }) {
  const login = useAction(api.accounts.login);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="login">
      <section>
        <img src="assets/logo.webp" alt="Fish N Tingz" />
        <p className="eyebrow">THE PEOPLE BEHIND THE GOOD TINGZ</p>
        <h1>Welcome back.</h1>
        <p>Sign in to manage your menu, events, and restaurant.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const d = new FormData(e.currentTarget);
            try {
              const r = await login({
                username: d.get("username"),
                password: d.get("password"),
              });
              if (r.error) setError(r.error);
              else onLogin(r.token);
            } catch {
              setError(
                "Unable to sign in. Check your connection and try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Username
            <input name="username" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button disabled={busy}>{busy ? "Signing in…" : "Sign in →"}</button>
        </form>
        <a href={publicSite}>← Back to the restaurant</a>
      </section>
    </div>
  );
}
function Modal({ children, onClose, label }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={label}
      onCancel={onClose}
    >
      {children}
    </dialog>
  );
}
function MenuEditor({ item, token, onClose, notify }) {
  const save = useMutation(api.content.saveMenu),
    [busy, setBusy] = useState(false);
  return (
    <Modal onClose={onClose} label="edit-title">
      <button
        className="close secondary"
        onClick={onClose}
        aria-label="Close editor"
      >
        ×
      </button>
      <p className="eyebrow">MENU EDITOR</p>
      <h2 id="edit-title">{item.name}</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          setBusy(true);
          try {
            await save({
              token,
              id: item._id,
              slug: item.slug,
              name: d.get("name"),
              description: d.get("description"),
              category: d.get("category"),
              price: d.get("price") === "" ? null : Number(d.get("price")),
              image: d.get("image"),
              options: item.options,
              available: d.has("available"),
              published: d.has("published"),
              sortOrder: item.sortOrder,
            });
            notify("Menu item updated.");
            onClose();
          } catch (e) {
            notify(e.message, true);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Name
          <input
            name="name"
            defaultValue={item.name}
            maxLength="120"
            required
            autoFocus
          />
        </label>
        <div className="form-grid">
          <label>
            Price ($)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={item.price ?? ""}
            />
          </label>
          <label>
            Category
            <select name="category" defaultValue={item.category}>
              {[
                "Appetizers",
                "Dinner",
                "Sunday brunch",
                "Brunch sides",
                "Signature drinks",
                "For the table",
                "Soft drinks",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Description
          <textarea
            name="description"
            rows="3"
            defaultValue={item.description}
            maxLength="1500"
          />
        </label>
        <label>
          Image path or HTTPS URL
          <input name="image" defaultValue={item.image} />
        </label>
        {item.options.length > 0 && (
          <p className="hint">
            Options:{" "}
            {item.options
              .map(
                (o) =>
                  o.name +
                  ": " +
                  o.choices
                    .map(
                      (c) => c.label + (c.extra ? " (+$" + c.extra + ")" : ""),
                    )
                    .join(", "),
              )
              .join(" · ")}
          </p>
        )}
        <label className="check">
          <input
            type="checkbox"
            name="available"
            defaultChecked={item.available}
          />
          Available to order
        </label>
        <label className="check">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item.published}
          />
          Published on the website
        </label>
        <button disabled={busy}>{busy ? "Saving…" : "Save menu item"}</button>
      </form>
    </Modal>
  );
}
function EventEditor({ item, token, onClose, notify }) {
  const save = useMutation(api.content.saveEvent),
    [busy, setBusy] = useState(false);
  return (
    <Modal onClose={onClose} label="event-edit-title">
      <button
        className="close secondary"
        onClick={onClose}
        aria-label="Close editor"
      >
        ×
      </button>
      <h2 id="event-edit-title">
        {item._id ? "Edit event" : "Create an event"}
      </h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          setBusy(true);
          try {
            await save({
              token,
              ...(item._id ? { id: item._id } : {}),
              title: d.get("title"),
              schedule: d.get("schedule"),
              description: d.get("description"),
              image: d.get("image"),
              published: d.has("published"),
              sortOrder: item.sortOrder || 0,
            });
            notify("Event saved.");
            onClose();
          } catch (e) {
            notify(e.message, true);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Title
          <input
            name="title"
            defaultValue={item.title}
            required
            maxLength="120"
            autoFocus
          />
        </label>
        <label>
          Date or recurring schedule
          <input
            name="schedule"
            defaultValue={item.schedule}
            placeholder="Saturday, October 24 · 7 PM"
            required
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            rows="4"
            defaultValue={item.description}
            maxLength="1500"
          />
        </label>
        <label>
          Image path or HTTPS URL
          <input
            name="image"
            defaultValue={item.image || "assets/images/our-space.webp"}
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item.published ?? false}
          />
          Publish on the events page
        </label>
        <button disabled={busy}>{busy ? "Saving…" : "Save event"}</button>
      </form>
    </Modal>
  );
}
function Settings({ data, token, notify }) {
  const save = useMutation(api.content.saveSettings),
    [busy, setBusy] = useState(false);
  return (
    <section className="panel">
      <h2>Restaurant details</h2>
      <p className="muted">Updates appear on the public website immediately.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          setBusy(true);
          try {
            await save({ token, ...Object.fromEntries(d) });
            notify("Restaurant settings saved.");
          } catch (e) {
            notify(e.message, true);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <label>
            Phone
            <input name="phone" defaultValue={data.phone} required />
          </label>
          <label>
            Address
            <input name="address" defaultValue={data.address} required />
          </label>
        </div>
        <label>
          Opening hours <span className="hint">One day | hours per line</span>
          <textarea name="hours" rows="6" defaultValue={data.hours} required />
        </label>
        <label>
          Toast ordering URL
          <input
            type="url"
            name="orderingUrl"
            defaultValue={data.orderingUrl}
            placeholder="https://..."
          />
        </label>
        <label>
          Appispot space booking URL
          <input
            type="url"
            name="bookingUrl"
            defaultValue={data.bookingUrl}
            placeholder="https://..."
          />
        </label>
        <p className="hint">
          Until a booking URL is added, “Book this space” invites guests to call
          the restaurant.
        </p>
        <button disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
      </form>
    </section>
  );
}
function Dashboard({ token, user, onLogout }) {
  const data = useQuery(
      api.content.dashboard,
      user.role === "admin" ? { token } : "skip",
    ),
    [tab, setTab] = useState("Overview"),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [editing, setEditing] = useState(null),
    [event, setEvent] = useState(null),
    [notice, setNotice] = useState(null);
  function notify(text, error = false) {
    setNotice({ text, error });
  }
  if (user.role !== "admin")
    return (
      <main className="setup">
        <h1>Administrator access required</h1>
        <button onClick={onLogout}>Sign out</button>
      </main>
    );
  return (
    <div className="dashboard">
      <aside>
        <img src="assets/logo.webp" alt="Fish N Tingz" />
        <p className="eyebrow">STAFF PORTAL</p>
        <nav>
          {["Overview", "Menu", "Events", "Settings"].map((t, n) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => {
                setTab(t);
                setNotice(null);
              }}
            >
              <span>{["◫", "☷", "▦", "⚙"][n]}</span>
              {t}
            </button>
          ))}
        </nav>
        <a href={publicSite} target="_blank" rel="noopener">
          View website ↗
        </a>
        <div className="staff">
          <strong>{user.username}</strong>
          <small>Administrator</small>
          <button onClick={onLogout}>Sign out</button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <p className="eyebrow">FISH N TINGZ · MANCHESTER</p>
            <h1>
              {tab === "Overview"
                ? "Good things start here."
                : tab === "Menu"
                  ? "On the menu."
                  : tab === "Events"
                    ? "Bring people together."
                    : "Make it yours."}
            </h1>
          </div>
          <div className="header-actions">
            <span className="live-dot">Production</span>
            <button className="mobile-logout secondary" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </header>
        {notice && (
          <div
            role={notice.error ? "alert" : "status"}
            className={notice.error ? "notice error" : "notice"}
          >
            {notice.text}
            <button
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}
        {!data ? (
          <p>Loading your restaurant…</p>
        ) : (
          <>
            {tab === "Overview" && (
              <>
                <div className="stats">
                  <article>
                    <span>Menu items</span>
                    <strong>{data.menu.length}</strong>
                    <small>Food, drinks & all the tingz</small>
                  </article>
                  <article>
                    <span>Available now</span>
                    <strong>
                      {
                        data.menu.filter((i) => i.available && i.published)
                          .length
                      }
                    </strong>
                    <small>Published and ready to order</small>
                  </article>
                  <article>
                    <span>Published events</span>
                    <strong>
                      {data.events.filter((i) => i.published).length}
                    </strong>
                    <small>Reasons to come together</small>
                  </article>
                </div>
                <section className="overview-feature">
                  <div>
                    <p className="eyebrow">YOUR RESTAURANT, AT A GLANCE</p>
                    <h2>
                      Keep the good
                      <br />
                      tingz coming.
                    </h2>
                    <p>
                      Refresh the menu, share what’s happening, and keep your
                      guests in the loop.
                    </p>
                    <button onClick={() => setTab("Menu")}>
                      Manage your menu →
                    </button>
                  </div>
                  <img
                    src={imageUrl("assets/images/red-snapper.webp")}
                    alt="Whole red snapper"
                  />
                </section>
                <section className="panel">
                  <h2>Your connections</h2>
                  <div className="connection-row">
                    <span>Online ordering · Toast</span>
                    <a
                      href={data.settings.orderingUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      Open ordering ↗
                    </a>
                  </div>
                  <div className="connection-row">
                    <span>Space bookings · Appispot</span>
                    <button
                      className="secondary"
                      onClick={() => setTab("Settings")}
                    >
                      {data.settings.bookingUrl
                        ? "Manage booking link"
                        : "Add booking link →"}
                    </button>
                  </div>
                </section>
              </>
            )}
            {tab === "Menu" && (
              <>
                <div className="toolbar">
                  <input
                    aria-label="Search menu"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your menu…"
                  />
                  <select
                    aria-label="Filter category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>All</option>
                    {[...new Set(data.menu.map((i) => i.category))].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <span>{data.menu.length} items</span>
                </div>
                <section className="panel menu-table">
                  <div className="table-row table-head">
                    <span>Item</span>
                    <span>Price</span>
                    <span>Status</span>
                    <span></span>
                  </div>
                  {data.menu
                    .filter(
                      (i) =>
                        (category === "All" || i.category === category) &&
                        i.name.toLowerCase().includes(search.toLowerCase()),
                    )
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((i) => (
                      <div className="table-row" key={i._id}>
                        <div className="item-cell">
                          {i.image && <img src={imageUrl(i.image)} alt="" />}
                          <div>
                            <strong>{i.name}</strong>
                            <small>{i.category}</small>
                          </div>
                        </div>
                        <span>
                          {i.price === null ? "Market" : "$" + i.price}
                        </span>
                        <span
                          className={
                            "badge " +
                            (!i.published || !i.available ? "off" : "")
                          }
                        >
                          {!i.published
                            ? "Draft"
                            : i.available
                              ? "Available"
                              : "Unavailable"}
                        </span>
                        <button
                          className="secondary"
                          onClick={() => setEditing(i)}
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                </section>
              </>
            )}
            {tab === "Events" && (
              <>
                <div className="toolbar">
                  <p>Manage your recurring nights and upcoming gatherings.</p>
                  <button onClick={() => setEvent({})}>+ New event</button>
                </div>
                <div className="event-grid">
                  {data.events.map((e) => (
                    <article className="panel event-card" key={e._id}>
                      <img src={imageUrl(e.image)} alt="" />
                      <span className="badge">
                        {e.published ? "Published" : "Draft"}
                      </span>
                      <h2>{e.title}</h2>
                      <p className="eyebrow">{e.schedule}</p>
                      <p>{e.description}</p>
                      <button className="secondary" onClick={() => setEvent(e)}>
                        Edit event
                      </button>
                    </article>
                  ))}
                </div>
              </>
            )}
            {tab === "Settings" && (
              <Settings data={data.settings} token={token} notify={notify} />
            )}
          </>
        )}
      </main>
      {editing && (
        <MenuEditor
          item={editing}
          token={token}
          onClose={() => setEditing(null)}
          notify={notify}
        />
      )}
      {event && (
        <EventEditor
          item={event}
          token={token}
          onClose={() => setEvent(null)}
          notify={notify}
        />
      )}
    </div>
  );
}
export default function App() {
  const [token, setToken] = useState(
      () => sessionStorage.getItem("fnt-staff-token") || "",
    ),
    user = useQuery(api.auth.me, token ? { token } : "skip"),
    logout = useMutation(api.auth.logout);
  function onLogin(t) {
    sessionStorage.setItem("fnt-staff-token", t);
    setToken(t);
  }
  async function onLogout() {
    try {
      await logout({ token });
    } finally {
      sessionStorage.removeItem("fnt-staff-token");
      setToken("");
    }
  }
  if (token && user === undefined)
    return <main className="setup">Connecting to your restaurant…</main>;
  if (!token || !user) return <Login onLogin={onLogin} />;
  return <Dashboard token={token} user={user} onLogout={onLogout} />;
}
