import { useEffect, useState } from "react";
import axios from "axios";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";
import "./App.css";
const API = "http://127.0.0.1:8000/api";
function AdvancedStoryEditor({
  content,
  onChange,
  dark,
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "story-editor-content",
        "aria-label": "Write your story",
        spellcheck: "true",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== (content || "")) {
      editor.commands.setContent(content || "", {
        emitUpdate: false,
      });
    }
  }, [editor, content]);

  if (!editor) {
    return <p>Preparing your writing space...</p>;
  }

  const tools = [
    {
      label: "B",
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "I",
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "H2",
      title: "Heading",
      action: () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "❝",
      title: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "• List",
      title: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "1. List",
      title: "Numbered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
  ];

  return (
    <div className={`advanced-editor ${dark ? "editor-dark" : ""}`}>
      <div className="editor-toolbar">
        {tools.map((tool) => (
          <button
            key={tool.title}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            className={tool.active ? "tool-active" : ""}
            onClick={tool.action}
          >
            {tool.label}
          </button>
        ))}

        <span className="toolbar-hint">
          Your ideas, beautifully expressed.
        </span>
      </div>

            <EditorContent editor={editor} />

      
    </div>
  );
}
    
function App() {
  const handleLike = async (postId) => {
    try {
      const response = await client.post(`/posts/${postId}/like/`);

      console.log("LIKE SUCCESS:", response.data);

      await loadPosts();
    } catch (error) {
      console.error("LIKE ERROR STATUS:", error.response?.status);
      console.error("LIKE ERROR DATA:", error.response?.data);
      console.error("LIKE ERROR MESSAGE:", error.message);

      alert(
        `Like failed: ${error.response?.status || error.message}\n` +
        JSON.stringify(error.response?.data || {})
      );
    }
  };
  const [expandedPosts, setExpandedPosts] = useState([]);
  const [dark, setDark] = useState(false);
  const [posts, setPosts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("inkwell_token") || "");
  const [user, setUser] = useState(localStorage.getItem("inkwell_user") || "");
  const [page, setPage] = useState("home");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(6);
const plainText = content
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/g, " ")
  .trim();

const wordCount = plainText
  ? plainText.split(/\s+/).length
  : 0;

const characterCount = plainText.length;

const readingMinutes = Math.max(
  1,
  Math.ceil(wordCount / 200)
);

const writingProgress = Math.min(
  100,
  Math.round((wordCount / 500) * 100)
);
  const client = axios.create({
  baseURL: API,
});

client.interceptors.request.use((config) => {
  const savedToken = localStorage.getItem("inkwell_token");

  if (savedToken) {
    config.headers.Authorization = `Bearer ${savedToken}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const savedToken = localStorage.getItem("inkwell_token");

      if (savedToken) {
        localStorage.removeItem("inkwell_token");
        localStorage.removeItem("inkwell_user");

        setToken("");
        setUser("");
        setMessage("Your session has expired. Please log in again.");
        setPage("login");
      }
    }

    return Promise.reject(error);
  }
);

  async function loadPosts() {
    try {
      const response = await axios.get(`${API}/posts/`);
      setPosts(response.data.results || response.data);
    } catch {
      setMessage("Could not connect to the backend. Check that Django is running.");
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = [...posts]
    .filter((post) => {
      const query = searchTerm.trim().toLowerCase();
      return (
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.author?.username || "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === "author") {
        return (a.author?.username || "").localeCompare(
          b.author?.username || ""
        );
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  const [previewMode, setPreviewMode] = useState(false);

  const [tags, setTags] = useState([]);

  const [tagInput, setTagInput] = useState("");

  const [draftSaved, setDraftSaved] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const visiblePosts = filteredPosts.slice(0, visibleCount);

  async function authenticate(event) {
    event.preventDefault();
    try {
      if (page === "register") {
        await axios.post(`${API}/auth/register/`, {
          username,
          email,
          password,
        });
      }

      const response = await axios.post(`${API}/auth/login/`, {
        username,
        password,
      });

      localStorage.setItem("inkwell_token", response.data.access);
      localStorage.setItem("inkwell_user", username);
      setToken(response.data.access);
      setUser(username);
      setPage("home");
      setMessage("Welcome to InkWell!");
      setPassword("");
      await loadPosts();
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data || "Authentication failed")
      );
    }
  }

  function logout() {
    localStorage.removeItem("inkwell_token");
    localStorage.removeItem("inkwell_user");
    setToken("");
    setUser("");
    setPage("home");
    setMessage("You have logged out.");
  }

  async function savePost(event) {
  event.preventDefault();

  if (!token) {
    setMessage("Please log in before publishing a story.");
    setPage("login");
    return;
  }

  if (!title.trim() || !plainText) {
    setMessage("Please enter a title and story content.");
    return;
  }

  setPublishing(true);

  try {
    const payload = {
      title: title.trim(),
      content,
    };

    if (editing) {
      await client.patch(`${API}/posts/${editing}/`, payload);
    } else {
      await client.post(`${API}/posts/`, payload);
    }

    localStorage.removeItem(
      editing ? `inkwell_draft_${editing}` : "inkwell_new_draft"
    );

    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    setEditing(null);
    setPreviewMode(false);
    setDraftSaved(false);

    setMessage(
      editing
        ? "Your story has been updated successfully."
        : "Your story has been published successfully."
    );

    setPage("home");
    await loadPosts();
  } catch (error) {
    setMessage(
      error.response?.data?.detail ||
        "Unable to publish your story. Please check your connection and try again."
    );
  } finally {
    setPublishing(false);
  }
}
  async function deletePost(id) {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await client.delete(`${API}/posts/${id}/`);
      setMessage("Post deleted.");
      await loadPosts();
    } catch {
      setMessage("You can delete only your own posts.");
    }
  }

  async function addComment(postId, text) {
    if (!text.trim()) return;
    try {
      await client.post(`${API}/posts/${postId}/comments/`, { content: text });
      await loadPosts();
      setMessage("Comment added.");
    } catch {
      setMessage("Please log in to comment.");
    }
  }

  async function editComment(id, oldText) {
    const content = window.prompt("Edit your comment:", oldText);
    if (content === null || !content.trim()) return;
    try {
      await client.patch(`${API}/comments/${id}/`, { content });
      await loadPosts();
      setMessage("Comment updated.");
    } catch {
      setMessage("You can edit only your own comments.");
    }
  }

  async function deleteComment(id) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await client.delete(`${API}/comments/${id}/`);
      await loadPosts();
      setMessage("Comment deleted.");
    } catch {
      setMessage("You can delete only your own comments.");
    }
  }

  return (
    <div className={dark ? "app dark" : "app"}>
      <header className="navbar">
        <button className="brand" onClick={() => setPage("home")}>
  <img
    src="/inkwell-logo.png"
    alt="InkWell logo"
    className="brand-logo"
  />
  <span>InkWell</span>
</button>
        <nav>
          <button onClick={() => setPage("home")}>Explore</button>
          {token && <button onClick={() => { setEditing(null); setTitle(""); setContent(""); setPage("write"); }}>Write a post</button>}
          {!token ? (
            <>
              <button onClick={() => setPage("login")}>Log in</button>
              <button className="primary small" onClick={() => setPage("register")}>Get started</button>
            </>
          ) : (
            <>
              <span className="welcome">Hi, {user}</span>
              <button onClick={logout}>Log out</button>
            </>
          )}
          <button className="theme-toggle" onClick={() => setDark(!dark)} title="Toggle theme">
            {dark ? "☀️" : "🌙"}
          </button>
        </nav>
      </header>

      <main>
        {message && (
          <div className="notice">
            <span>{message}</span>
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {page === "home" && (
          <>
            {/* PROFESSIONAL INKWELL HERO */}
<section className="editorial-hero">
  <div className="editorial-hero-content">
    <span className="editorial-eyebrow">
      <span className="editorial-dot"></span>
      A COMMUNITY FOR CURIOUS MINDS
    </span>

    <h1>
      Stories that
      <br />
      <em>stay with you.</em>
    </h1>

    <p className="editorial-description">
      Discover fresh perspectives, explore thoughtful ideas,
      and share the stories that make you who you are.
      Your next chapter starts here.
    </p>

    <div className="editorial-actions">
      <button
        className="editorial-primary"
        onClick={() =>
          document.querySelector(".feed")?.scrollIntoView({
            behavior: "smooth",
          })
        }
      >
        Explore stories <span>↗</span>
      </button>

      <button
        className="editorial-secondary"
        onClick={() => {
          if (token) {
            setEditing(null);
            setTitle("");
            setContent("");
            setTags([]);
            setPreviewMode(false);
            setPage("write");
          } else {
            setPage("register");
          }
        }}
      >
        Start writing <span>→</span>
      </button>
    </div>

    <div className="editorial-trust">

      <p>
        A little inspiration.
        A different perspective.
      
        A story worth sharing.
      </p>
    </div>
  </div>

  <div className="editorial-hero-visual">
   <div className="editorial-main-image">
  <img
    src="/photo-1455390582262-044cdead277a.avif"
    alt="Open book pages inspiring a new story"
  />

  <div className="hero-image-overlay">
    <span className="hero-image-kicker">THE INKWELL JOURNAL</span>
    <h2>Every page holds<br />a new possibility.</h2>
    <span className="hero-image-caption">
      WRITE · REFLECT · INSPIRE
    </span>
  </div>

</div>

    <div className="editorial-floating-card">
      <span className="floating-card-icon">“</span>
      <p>Every great story begins with a single thought.</p>
      <span className="floating-card-label">YOUR NEXT CHAPTER</span>
    </div>

      </div>
</section>

<div className="editorial-bottom-line">
  <span className="editorial-bottom-message">
    A space for ideas, stories, and new perspectives.
  </span>

  <button
    type="button"
    onClick={() =>
      document.querySelector(".feed")?.scrollIntoView({
        behavior: "smooth",
      })
    }
  >
    Discover the community <span>↗</span>
  </button>
</div>
{/* BEAUTIFUL EDITORIAL INSPIRATION SECTION */}
<section className="inspiration-section">
  <div className="inspiration-heading">
    <div className="inspiration-title-group">
      <span className="eyebrow">
        <span className="inspiration-eyebrow-dot"></span>
        A LITTLE INSPIRATION
      </span>

      <h2>
        Ideas worth <em>exploring.</em>
      </h2>
    </div>

    <div className="inspiration-heading-right">
      <p>
        Every great story begins with a little curiosity.
        Discover new perspectives, find inspiration, and
        turn ordinary moments into extraordinary stories.
      </p>

      <button
        className="inspiration-explore-link"
        onClick={() =>
          document.querySelector(".feed")?.scrollIntoView({
            behavior: "smooth",
          })
        }
      >
        Explore community stories <span>↗</span>
      </button>
    </div>
  </div>

  <div className="inspiration-grid">
    {/* CARD 1 */}
    <article className="inspiration-card inspiration-large">
      <div className="inspiration-image-wrap">
        <img
          src="/photo-1470770841072-f978cf4d019e.avif"
          alt="Peaceful mountain landscape beside a lake"
          loading="lazy"
        />

        <span className="inspiration-card-number">01</span>

        <div className="inspiration-overlay">
          <span className="inspiration-category">
            TRAVEL · REFLECTION · LIFE
          </span>

          <h3>
            Sometimes, a change of scenery changes everything.
          </h3>

          <p>
            Step away, discover something new, and see the
            world from a different perspective.
          </p>

          <button
            className="inspiration-card-link"
            onClick={() =>
              document.querySelector(".feed")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Find your inspiration <span>↗</span>
          </button>
        </div>
      </div>
    </article>

    {/* CARD 2 */}
    <article className="inspiration-card">
      <div className="inspiration-image-wrap">
        <img
          src="/photo-1495446815901-a7297e633e8d.avif"
          alt="Books arranged on a bookshelf"
          loading="lazy"
        />

        <span className="inspiration-card-number">02</span>

        <div className="inspiration-overlay">
          <span className="inspiration-category">
            BOOKS · KNOWLEDGE · GROWTH
          </span>

          <h3>Every page opens a new world.</h3>

          <p>
            Explore new ideas, learn something meaningful,
            and let your imagination grow.
          </p>

          <button
            className="inspiration-card-link"
            onClick={() =>
              document.querySelector(".feed")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Discover new ideas <span>↗</span>
          </button>
        </div>
      </div>
    </article>

    {/* CARD 3 */}
    <article className="inspiration-card">
      <div className="inspiration-image-wrap">
        <img
          src="/photo-1638342863994-ae4eee256688.avif"
          alt="Creative writing and inspiration"
          loading="lazy"
        />

        <span className="inspiration-card-number">03</span>

        <div className="inspiration-overlay">
          <span className="inspiration-category">
            WRITING · CREATIVITY · IDEAS
          </span>

          <h3>Give your ideas a place to grow.</h3>

          <p>
            Your experiences matter. Put your thoughts into
            words and share your unique perspective.
          </p>

          <button
            className="inspiration-card-link"
            onClick={() => {
              if (token) {
                setEditing(null);
                setTitle("");
                setContent("");
                setTags([]);
                setPreviewMode(false);
                setPage("write");
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                setPage("register");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Create your story <span>↗</span>
          </button>
        </div>
      </div>
    </article>
  </div>
</section>
            <section className="feed">
              <div className="section-heading">
                <div><p className="eyebrow">THE COMMUNITY</p><h2>Latest stories</h2></div>
                <span>{filteredPosts.length} {filteredPosts.length === 1 ? "story" : "stories"}</span>
              </div>

              <div className="explore-controls">
                <div className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    placeholder="Search stories, content, or authors..."
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setVisibleCount(6);
                    }}
                    aria-label="Search stories"
                  />
                  {searchTerm && (
                    <button type="button" onClick={() => setSearchTerm("")}>
                      Clear
                    </button>
                  )}
                </div>
                <label className="sort-control">
                  <span>Sort by</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="author">Author A–Z</option>
                  </select>
                </label>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="empty">
                  <span className="empty-icon">✍</span>
                  <h3>{searchTerm ? "No stories found." : "Your reading list starts here."}</h3>
                  <p>{searchTerm ? "Try another title, keyword, or author name." : "There are no stories yet. Be the first to share a thought."}</p>
                </div>
              ) : (
                <>
  <div className="post-grid">
  {visiblePosts.map((post) => {
    const isExpanded = expandedPosts.includes(post.id);

    // Convert the HTML story into plain text for a clean preview.
    const plainContent = (() => {
      const element = document.createElement("div");
      element.innerHTML = DOMPurify.sanitize(post.content || "");
      return element.textContent || element.innerText || "";
    })();

    const needsReadMore = plainContent.length > 220;

    const previewContent = needsReadMore && !isExpanded
      ? `${plainContent.slice(0, 220).trim()}...`
      : plainContent;

    return (
      <article className="post-card" key={post.id}>
        {/* Author and date */}
        <div className="post-meta">
          <span className="avatar">
            {post.author?.username?.[0]?.toUpperCase() || "I"}
          </span>

          <span className="post-author-name">
            {post.author?.username || "InkWell writer"}
          </span>

          <span className="post-meta-dot">·</span>

          <span className="post-date">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Story title */}
        <h3 className="post-title">{post.title}</h3>

        {/* Story preview and full reading area */}
<div
  className={`post-reading-area ${
    isExpanded ? "post-reading-expanded" : ""
  }`}
>
  <div className="post-content">
    {isExpanded ? (
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(post.content || ""),
        }}
      />
    ) : (
      <p>{previewContent}</p>
    )}
  </div>
</div>

{/* Read More / Read Less */}
{needsReadMore && (
  <button
    type="button"
    className="read-more-button"
    onClick={() => {
      setExpandedPosts((current) =>
        isExpanded
          ? current.filter((id) => id !== post.id)
          : [...current, post.id]
      );
    }}
  >
    {isExpanded ? "Read less ↑" : "Read more →"}
  </button>
)}

       {/* Post footer */}
<div className="post-footer">
  <div className="post-engagement">
    <button
  type="button"
  className={`post-like-button ${post.liked_by_me ? "liked" : ""}`}
  onClick={() => handleLike(post.id)}
  disabled={!token}
  title={!token ? "Log in to like this story" : "Like or unlike this story"}
>
  <span aria-hidden="true">
    {post.liked_by_me ? "♥" : "♡"}
  </span>

  <span>{post.likes_count ?? 0}</span>
  <span>Likes</span>
</button>

    <span className="post-comment-count">
      {post.comments_count ?? post.comments?.length ?? 0} comments
    </span>
  </div>

          {token && user === post.author?.username && (
            <div className="post-actions">
              <button
                type="button"
                onClick={() => {
                  setEditing(post.id);
                  setTitle(post.title);
                  setContent(post.content);
                  setPage("write");
                }}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => deletePost(post.id)}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="comments">
          {(post.comments || []).map((comment) => (
            <div className="comment" key={comment.id}>
              <div className="comment-main">
                <strong>{comment.author?.username}</strong>
                <p>{comment.content}</p>
              </div>

              {token && user === comment.author?.username && (
                <div className="comment-actions">
                  <button
                    type="button"
                    onClick={() => editComment(comment.id, comment.content)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteComment(comment.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}

          <CommentForm
            onSubmit={(text) => addComment(post.id, text)}
            loggedIn={!!token}
            onLogin={() => setPage("login")}
          />
        </div>
      </article>
    );
  })}
</div>
                {visibleCount < filteredPosts.length && (
                  <div className="load-more-wrap">
                    <button
                      className="secondary load-more"
                      onClick={() => setVisibleCount((count) => count + 6)}
                    >
                      Load more stories
                    </button>
                    <p>Showing {visiblePosts.length} of {filteredPosts.length} stories</p>
                  </div>
                )}
                </>
              )}
            </section>
            


{/* FEATURED STORY */}
{posts.length > 0 && (
  <section className="featured-section">
    <div className="home-section-heading">
      <div>
        <span className="eyebrow">WORTH YOUR TIME</span>
        <h2>
          In the spotlight<span>.</span>
        </h2>
      </div>

      
    </div>

    <article className="featured-story">

      {/* LEFT: IMAGE ONLY */}
      <div className="featured-art featured-image-panel">
        <img
          src="Golden Quill and Ink Bottle Still Life.png"
          alt="Vintage blue feather quill, golden ink bottle, and handwritten parchment"
          className="featured-story-image"
          loading="lazy"
        />
      </div>

      {/* RIGHT: FEATURED POST */}
      <div className="featured-copy">
        <span className="featured-tag">
          COMMUNITY PICK
        </span>

        <h3>{posts[0].title}</h3>

        <p className="featured-excerpt">
          {(() => {
            const cleanText = document.createElement("div");

            cleanText.innerHTML = DOMPurify.sanitize(
              posts[0].content || ""
            );

            const excerpt = (
              cleanText.textContent ||
              cleanText.innerText ||
              ""
            ).trim();

            return excerpt.length > 230
              ? `${excerpt.slice(0, 230)}…`
              : excerpt;
          })()}
        </p>

        <div className="featured-author">
          <span className="avatar">
            {posts[0].author?.username?.[0]?.toUpperCase() || "I"}
          </span>

          <div>
            <strong>
              {posts[0].author?.username || "InkWell writer"}
            </strong>

            <small>
              {new Date(
                posts[0].created_at
              ).toLocaleDateString()}
            </small>
          </div>
        </div>

        <button
          className="featured-read-button"
          onClick={() =>
            document.querySelector(".feed")?.scrollIntoView({
              behavior: "smooth"
            })
          }
        >
          Discover this story <span>↗</span>
        </button>
      </div>

    </article>
  </section>
)}
{/* WHY INKWELL */}
<section className="why-section">
  <div className="why-heading">
    <span className="eyebrow">MORE THAN WORDS</span>
    <h2>Make room for<br /><em>what matters.</em></h2>
    <p>
      Great communities grow when people share what they know,
      express what they feel, and stay open to new perspectives.
    </p>
  </div>

  <div className="benefit-grid">
    <article className="benefit-card">
      <span className="benefit-number">01</span>
      <div className="benefit-icon">✍</div>
      <h3>Write freely</h3>
      <p>
        Turn your experiences, lessons, and ideas into stories
        worth sharing with others.
      </p>
    </article>

    <article className="benefit-card">
      <span className="benefit-number">02</span>
      <div className="benefit-icon">⌕</div>
      <h3>Discover perspectives</h3>
      <p>
        Explore what others are thinking and find inspiration
        in viewpoints different from your own.
      </p>
    </article>

    <article className="benefit-card">
      <span className="benefit-number">03</span>
      <div className="benefit-icon">♡</div>
      <h3>Connect through words</h3>
      <p>
        Join thoughtful conversations, exchange ideas, and
        learn from a community of writers.
      </p>
    </article>
  </div>
</section>

{/* HOW IT WORKS — EDITORIAL BACKGROUND */}
<section className="how-section">
  <div className="how-background-image" aria-hidden="true"></div>
  <div className="how-background-overlay" aria-hidden="true"></div>

  <div className="how-content">
    <div className="how-heading">
      <span className="eyebrow">YOUR NEXT CHAPTER</span>

      <h2>
        Three steps.
        <br />
        <em>Endless stories.</em>
      </h2>

      <p>
        Every meaningful story begins with an idea.
        Find your voice, share your experiences, and connect
        with people who see the world differently.
      </p>
    </div>

    <div className="steps-grid">
      <article className="step-item">
        <div className="step-top">
          <span className="step-number">01</span>
          <span className="step-icon" aria-hidden="true">✍</span>
        </div>

        <h3>Find your voice</h3>

        <p>
          Create your account and make space for your thoughts,
          experiences, creativity, and ideas.
        </p>

        <span className="step-caption">YOUR SPACE · YOUR VOICE</span>
      </article>

      <article className="step-item">
        <div className="step-top">
          <span className="step-number">02</span>
          <span className="step-icon" aria-hidden="true">↗</span>
        </div>

        <h3>Share your story</h3>

        <p>
          Turn your thoughts into stories. Write, edit, and publish
          your words for others to discover and enjoy.
        </p>

        <span className="step-caption">WRITE · CREATE · PUBLISH</span>
      </article>

      <article className="step-item">
        <div className="step-top">
          <span className="step-number">03</span>
          <span className="step-icon" aria-hidden="true">♡</span>
        </div>

        <h3>Join the conversation</h3>

        <p>
          Discover different perspectives, appreciate other writers,
          and exchange meaningful comments with the community.
        </p>

        <span className="step-caption">READ · CONNECT · GROW</span>
      </article>
    </div>
  </div>
</section>
{/* COMMUNITY STATISTICS */}
<section className="community-band">

  {/* Background image and visual overlay */}
  <div
    className="community-background-decoration"
    aria-hidden="true"
  />

  {/* Left: Community introduction */}
  <div className="community-intro">

    <span className="eyebrow">
      THE INKWELL COMMUNITY
    </span>

    <h2>
      Every voice adds
      <br />
      <em>something valuable.</em>
    </h2>

    <p>
      A community grows when people share what they know,
      express what they feel, and remain open to new perspectives.
      Your story belongs here, too.
    </p>

    {!token && (
      <button
        type="button"
        className="community-join-button"
        onClick={() => setPage("register")}
      >
        Become a writer
        <span aria-hidden="true">↗</span>
      </button>
    )}

    {token && (
      <button
        type="button"
        className="community-join-button"
        onClick={() => {
          setEditing(null);
          setTitle("");
          setContent("");
          setTags([]);
          setTagInput("");
          setPreviewMode(false);
          setPage("write");
        }}
      >
        Share your story
        <span aria-hidden="true">↗</span>
      </button>
    )}

  </div>

  {/* Right: Community statistics */}
  <div className="community-statistics">

    {/* Published stories */}
    <div className="community-stat">

      <span
        className="community-stat-icon"
        aria-hidden="true"
      >
        ✍
      </span>

      <strong>
        {posts.length}
      </strong>

      <span className="community-stat-title">
        Stories published
      </span>

      <p>
        Ideas and experiences shared with the community.
      </p>

    </div>

    {/* Comments */}
    <div className="community-stat">

      <span
        className="community-stat-icon"
        aria-hidden="true"
      >
        ♡
      </span>

      <strong>
        {posts.reduce(
          (total, post) =>
            total +
            (post.comments_count ?? post.comments?.length ?? 0),
          0
        )}
      </strong>

      <span className="community-stat-title">
        Conversations started
      </span>

      <p>
        Comments that bring writers and readers together.
      </p>

    </div>

    {/* Writers */}
    <div className="community-stat">

      <span
        className="community-stat-icon"
        aria-hidden="true"
      >
        ✳
      </span>

      <strong>
        {
          new Set(
            posts
              .map((post) => post.author?.id)
              .filter(Boolean)
          ).size
        }
      </strong>

      <span className="community-stat-title">
        Writers represented
      </span>

      <p>
        Different voices contributing their own perspectives.
      </p>

    </div>

  </div>

  {/* Bottom signature */}
  <div className="community-bottom-line">

    <span>INKWELL JOURNAL</span>

    <span>
      Every story begins with a thought.
    </span>

  </div>

</section>
{/* FINAL CALL TO ACTION */}
<section className="home-cta">
  <div className="cta-decoration cta-decoration-one">✳</div>
  <div className="cta-decoration cta-decoration-two">“</div>

  <span className="eyebrow">YOUR STORY BELONGS HERE</span>
  <h2>The world doesn't need<br />another perfect story.<br /><em>It needs your honest one.</em></h2>
  <p>Start with a thought. Give it words. Let it grow.</p>

  <button
    className="cta-button"
    onClick={() => setPage(token ? "write" : "register")}
  >
    {token ? "Write your next story" : "Join the community"}
    <span>↗</span>
  </button>
</section>

          </>
        )}

        {/* ==========================================
    INKWELL — LOGIN & REGISTER
========================================== */}

{(page === "login" || page === "register") && (
  <section className={`auth-page ${dark ? "auth-dark" : ""}`}>
    <div className="auth-layout">

      {/* LEFT: BRANDING PANEL */}
      <aside className="auth-showcase">

        <div className="auth-brand">
          <span className="auth-logo">
            <img
              src="/inkwell-logo.png"
              alt="InkWell logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </span>

          <span>InkWell</span>
        </div>

        <div className="auth-showcase-content">
          <span className="auth-kicker">
            A SPACE FOR EVERY STORY
          </span>

          <h1>
            Your thoughts.
            <br />
            Your words.
            <br />
            <em>Your story.</em>
          </h1>

          <p>
            Every great story begins with a single thought.
            Find your voice, share your perspective, and discover
            stories that inspire you.
          </p>

          <div className="auth-quote">
            <span className="auth-quote-mark">“</span>

            <p>
              There is no greater agony than bearing
              an untold story inside you.
            </p>
          </div>
        </div>

        <div className="auth-showcase-footer">
          <span>INKWELL JOURNAL</span>
          <span>READ · REFLECT · GROW</span>
        </div>
      </aside>

      {/* RIGHT: AUTHENTICATION FORM */}
      <div className="auth-form-side">
        <div className="auth-card">

          <div className="auth-card-top">
            <span className="auth-card-label">
              {page === "login"
                ? "WELCOME BACK"
                : "YOUR NEXT CHAPTER"}
            </span>

            
          </div>

          <h2>
            {page === "login"
              ? "Your story awaits."
              : "Find your voice."}
          </h2>

          <p className="auth-description">
            {page === "login"
              ? "Welcome back. Log in to continue writing, discover stories, and connect with your community."
              : "Create your account and give your ideas a place to grow."}
          </p>

          <form className="auth-form" onSubmit={authenticate}>
            <label>
              Username

              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </label>

            {page === "register" && (
              <label>
                Email address

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
            )}

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  page === "login"
                    ? "Enter your password"
                    : "Create a password"
                }
                autoComplete={
                  page === "login"
                    ? "current-password"
                    : "new-password"
                }
                minLength={8}
                required
              />
            </label>

            <button
              className="auth-submit"
              type="submit"
            >
              <span>
                {page === "login"
                  ? "Log in to InkWell"
                  : "Create my account"}
              </span>

              <span className="auth-submit-arrow">↗</span>
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <span>YOUR STORY STARTS HERE</span>
            <span />
          </div>

          <p className="auth-switch">
            {page === "login"
              ? "New to InkWell?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setPage(
                  page === "login"
                    ? "register"
                    : "login"
                );

                setPassword("");
                setMessage("");
              }}
            >
              {page === "login"
                ? "Create an account"
                : "Log in"}
            </button>
          </p>

          <p className="auth-privacy">
            A thoughtful space for ideas, experiences, and stories.
          </p>

        </div>
      </div>

    </div>
  </section>
)}
{page === "read" && (
  <section className="full-story-page">
    <button
      type="button"
      className="back-to-stories"
      onClick={() => {
        setPage("home");
        setTitle("");
        setContent("");
      }}
    >
      ← Back to all stories
    </button>

    <article className="full-story-card">
      <span className="eyebrow">FROM THE INKWELL COMMUNITY</span>

      <h1>{title}</h1>

      <div className="full-story-divider" />

      <div
        className="full-story-content"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(content || ""),
        }}
      />

      <div className="full-story-bottom">
        <span>Thank you for reading.</span>

        <button
          type="button"
          className="editorial-primary"
          onClick={() => {
            setPage("home");

            setTimeout(() => {
              document.querySelector(".feed")?.scrollIntoView({
                behavior: "smooth",
              });
            }, 100);
          }}
        >
          Explore more stories ↗
        </button>
      </div>
    </article>
  </section>
)}
      {/* WRITE STORY PAGE */}
{page === "write" && (
  <section className="write-wrap advanced-write-wrap">

    {/* Page heading */}
    <header className="write-heading">
      <span className="eyebrow">
        {editing ? "REFINE YOUR THOUGHT" : "YOUR CREATIVE SPACE"}
      </span>

      <h1>
        {editing ? "Edit your story" : "A story of your own."}
      </h1>

      <p className="write-subtitle">
        Every meaningful story starts with a single thought.
        Take your time and make it yours.
      </p>
    </header>

    {/* Main writing card */}
    <form
      className="write-form advanced-write-form"
      onSubmit={savePost}
    >

      {/* Card top bar */}
      <div className="writing-topline">

        <div className="writing-status">
          <span className="status-dot" />

          {publishing
            ? "Publishing your story..."
            : draftSaved
              ? "Draft saved locally"
              : "Your writing space"}
        </div>

        <button
          type="button"
          className="preview-toggle"
          onClick={() => {
            setPreviewMode((current) => !current);
            setMessage("");
          }}
        >
          {previewMode ? "← Back to editor" : "Preview ↗"}
        </button>

      </div>

      {/* Story title */}
      <div className="simple-field story-title-label">

        <label htmlFor="story-title">
          Story title
        </label>

        <input
          id="story-title"
          className="story-title-input"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setDraftSaved(false);
          }}
          maxLength={200}
          required
          placeholder="Give your story a memorable title..."
        />

        <span className="field-hint">
          {title.length}/200 characters
        </span>

      </div>

      {/* Story content */}
      <div className="story-body-label">

        <label className="editor-section-label">
          Your story
        </label>

        {previewMode ? (
          <article className="story-preview">

            <span className="eyebrow">
              STORY PREVIEW
            </span>

            <h2>
              {title.trim() || "Your story title will appear here"}
            </h2>

            <div
              className="story-preview-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  content?.trim() ||
                    "<p>Your story will appear here...</p>"
                ),
              }}
            />

            <button
              type="button"
              className="secondary"
              onClick={() => setPreviewMode(false)}
            >
              ← Continue writing
            </button>

          </article>
        ) : (
          <AdvancedStoryEditor
  content={content}
  onChange={(value) => {
    setContent(value);
    setDraftSaved(false);
  }}
  dark={dark}
  wordCount={wordCount}
  characterCount={characterCount}
  readingMinutes={readingMinutes}
  writingProgress={writingProgress}
/>
        )}

      </div>
      {/* Tags */}
      <div className="tag-section">

        <div className="tag-heading">
          <label htmlFor="story-tags">
            Story tags
          </label>

          <span>{tags.length}/5</span>
        </div>

        <p className="tag-description">
          Help readers discover your story by topic.
        </p>

        <div className="tag-input-row">

          <input
            id="story-tags"
            value={tagInput}
            maxLength={30}
            placeholder="e.g. Personal Growth"
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();

                const tag = tagInput.trim();

                if (
                  tag &&
                  tags.length < 5 &&
                  !tags.some(
                    (existing) =>
                      existing.toLowerCase() === tag.toLowerCase()
                  )
                ) {
                  setTags((current) => [...current, tag]);
                  setTagInput("");
                }
              }
            }}
          />

          <button
            type="button"
            className="add-tag-button"
            onClick={() => {
              const tag = tagInput.trim();

              if (
                tag &&
                tags.length < 5 &&
                !tags.some(
                  (existing) =>
                    existing.toLowerCase() === tag.toLowerCase()
                )
              ) {
                setTags((current) => [...current, tag]);
                setTagInput("");
              }
            }}
            disabled={!tagInput.trim() || tags.length >= 5}
          >
            + Add
          </button>

        </div>

        <div className="story-tags">
          {tags.map((tag) => (
            <span className="story-tag" key={tag}>
              #{tag}

              <button
                type="button"
                aria-label={`Remove ${tag} tag`}
                onClick={() =>
                  setTags((current) =>
                    current.filter((item) => item !== tag)
                  )
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <p className="field-hint">
          Add up to five tags. Press Enter to add one.
        </p>

      </div>

      {/* Message area */}
      {message && (
        <div
          className="write-message"
          role="status"
        >
          {message}
        </div>
      )}

      {/* Form actions */}
      <div className="form-actions advanced-form-actions">

        <button
          type="button"
          className="secondary"
          onClick={() => {
            setPage("home");
            setPreviewMode(false);
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="save-draft-button"
          onClick={() => {
            const draft = {
              title,
              content,
              tags,
              savedAt: new Date().toISOString(),
            };

            localStorage.setItem(
              editing
                ? `inkwell_draft_${editing}`
                : "inkwell_new_draft",
              JSON.stringify(draft)
            );

            setDraftSaved(true);
            setMessage("Your draft has been saved on this device.");
          }}
        >
          Save draft
        </button>

        <button
          type="submit"
          className="publish-button"
          disabled={publishing}
        >
          {publishing
            ? "Publishing..."
            : editing
              ? "Update story ↗"
              : "Publish story ↗"}
        </button>

      </div>

      <p className="writing-footer-note">
        Your words matter. Write something meaningful.
      </p>

    </form>

  </section>
)}
      </main>
      {/* INKWELL FOOTER */}
<footer className="site-footer">
  <div className="footer-brand">
    <img
      src="/inkwell-logo.png"
      alt="InkWell logo"
      className="footer-logo"
    />

    <span className="footer-brand-name">InkWell</span>
  </div>

  <p className="footer-note">
    Thoughts deserve a place to grow.
  </p>

  <div className="footer-copyright">
    <span className="footer-copyright-symbol">©</span>
    <span>2026 InkWell</span>
  </div>
</footer>
         </div>
  );
}

function CommentForm({ onSubmit, loggedIn, onLogin }) {
  const [text, setText] = useState("");
  return (
    <form className="comment-form" onSubmit={e => { e.preventDefault(); onSubmit(text); setText(""); }}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder={loggedIn ? "Add a thoughtful comment..." : "Log in to join the conversation"} disabled={!loggedIn} />
      {loggedIn ? <button type="submit" disabled={!text.trim()}>Send ↗</button> : <button type="button" onClick={onLogin}>Log in</button>}
    </form>
  );
}

export default App;
