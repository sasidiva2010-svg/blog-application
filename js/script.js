
"use strict";

/* =====================================
   BLOGSPACE - SHARED JAVASCRIPT
   ===================================== */

const BlogSpace = (() => {
    const POSTS_KEY = "blogspace_posts";
    const PROFILE_KEY = "blogspace_demo_profile";

    function getPosts() {
        try {
            const posts = JSON.parse(localStorage.getItem(POSTS_KEY));
            return Array.isArray(posts) ? posts : [];
        } catch (error) {
            console.error("Unable to read blog posts:", error);
            return [];
        }
    }

    function savePosts(posts) {
        try {
            localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
            return true;
        } catch (error) {
            console.error("Unable to save blog posts:", error);
            return false;
        }
    }

    function createElement(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text || "";

        if (className) {
            element.className = className;
        }

        return element;
    }

    function initializeHomeSearch() {
        const search = document.getElementById("searchInput");
        const grid = document.getElementById("blogGrid");
        const empty = document.getElementById("noResults");

        if (!search || !grid) return;

        search.addEventListener("input", () => {
            const query = search.value.toLowerCase().trim();
            let count = 0;

            grid.querySelectorAll(".blog-card").forEach(card => {
                const matches = card.textContent
                    .toLowerCase()
                    .includes(query);

                card.hidden = !matches;

                if (matches) count++;
            });

            if (empty) {
                empty.hidden = count !== 0;
            }
        });
    }

    // Render saved posts on the Home page.
    // Call this instead of the old hardcoded-card implementation
    // when you want the Home page to show published posts.
    function renderHomePosts() {
        const grid = document.getElementById("blogGrid");
        if (!grid) return;

        const posts = getPosts();
        grid.replaceChildren();

        posts.forEach(post => {
            const card = createElement("article", "", "blog-card");

            card.appendChild(createElement(
                "span", post.category || "General", "category"
            ));

            card.appendChild(createElement("h3", post.title));
            card.appendChild(createElement("p", post.description));

            const link = createElement(
                "a", "Read More →", "read-more"
            );

            // This simple version links to Login.
            // A future detail page can display the full article.
            link.href = "login.html";

            card.appendChild(link);
            grid.appendChild(card);
        });

        initializeHomeSearch();
    }

    function renderDashboard() {
        const grid = document.getElementById("postGrid");
        const empty = document.getElementById("empty");
        const search = document.getElementById("search");

        if (!grid || !empty) return;

        const posts = getPosts();
        const query = search ? search.value.toLowerCase().trim() : "";

        const filtered = posts.filter(post =>
            [post.title, post.category, post.content]
                .some(value =>
                    String(value || "").toLowerCase().includes(query)
                )
        );

        grid.replaceChildren();

        empty.hidden = filtered.length !== 0;
        empty.textContent = posts.length
            ? "No matching posts found."
            : "No blog posts yet. Create your first post!";

        filtered.forEach(post => {
            const card = createElement("article", "", "post");

            card.appendChild(createElement(
                "span", post.category || "General", "category"
            ));

            card.appendChild(createElement("h3", post.title));

            const preview = String(post.content || "");
            card.appendChild(createElement(
                "p",
                preview.length > 150
                    ? preview.slice(0, 150) + "..."
                    : preview
            ));

            if (post.date) {
                const time = createElement(
                    "time",
                    new Date(post.date).toLocaleDateString()
                );
                card.appendChild(time);
            }

            const actions = createElement("div", "", "actions");

            const edit = createElement("a", "Edit", "btn");
            edit.href = "create-blog.html?edit=" +
                encodeURIComponent(post.id);

            const remove = createElement(
                "button", "Delete", "btn btn-danger"
            );
            remove.type = "button";

            remove.addEventListener("click", () => {
                if (!confirm("Are you sure you want to delete this post?")) {
                    return;
                }

                const remaining = getPosts().filter(
                    item => String(item.id) !== String(post.id)
                );

                if (savePosts(remaining)) {
                    renderDashboard();
                } else {
                    alert("Unable to save changes.");
                }
            });

            actions.append(edit, remove);
            card.appendChild(actions);
            grid.appendChild(card);
        });
    }

    function initializePasswordToggle() {
        const password = document.getElementById("password");
        const toggle = document.getElementById("togglePassword");

        if (!password || !toggle) return;

        toggle.addEventListener("click", () => {
            const show = password.type === "password";
            password.type = show ? "text" : "password";
            toggle.textContent = show ? "Hide" : "Show";
            toggle.setAttribute("aria-pressed", String(show));
            toggle.setAttribute(
                "aria-label",
                show ? "Hide password" : "Show password"
            );
        });
    }

    function initializeRegistration() {
        const form = document.getElementById("registerForm");
        if (!form) return;

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            const password = document.getElementById("password");
            const confirm = document.getElementById("confirmPassword");
            const message = document.getElementById("message");

            if (password.value !== confirm.value) {
                message.textContent = "Passwords do not match.";
                message.className = "message error";
                return;
            }

            const profile = {
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim()
            };

            try {
                localStorage.setItem(
                    PROFILE_KEY,
                    JSON.stringify(profile)
                );

                message.textContent =
                    "Demo profile saved. Real registration needs a backend.";
                message.className = "message success";
            } catch (error) {
                message.textContent = "Could not save the demo profile.";
                message.className = "message error";
            }
        });
    }

    function initializeCreateBlog() {
        const form = document.getElementById("blogForm");
        if (!form) return;

        const title = document.getElementById("title");
        const description = document.getElementById("description");
        const category = document.getElementById("category");
        const content = document.getElementById("content");
        const imageUrl = document.getElementById("imageUrl");
        const message = document.getElementById("message");

        const editId = new URLSearchParams(location.search).get("edit");
        let posts = getPosts();

        let existing = editId
            ? posts.find(post => String(post.id) === editId)
            : null;

        if (editId && !existing) {
            message.textContent = "Post not found.";
            message.className = "message error";
            form.hidden = true;
            return;
        }

        if (existing) {
            title.value = existing.title || "";
            description.value = existing.description || "";
            category.value = existing.category || "";
            content.value = existing.content || "";
            imageUrl.value = existing.imageUrl || "";

            document.getElementById("pageTitle").textContent =
                "Edit Blog Post";
            document.getElementById("publishButton").textContent =
                "Save Changes";
        }

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            const now = new Date().toISOString();

            const post = {
                id: existing
                    ? existing.id
                    : (crypto.randomUUID
                        ? crypto.randomUUID()
                        : String(Date.now())),
                title: title.value.trim(),
                description: description.value.trim(),
                category: category.value,
                content: content.value.trim(),
                imageUrl: imageUrl.value.trim(),
                date: existing ? existing.date : now,
                updatedAt: now
            };

            posts = existing
                ? posts.map(item =>
                    String(item.id) === String(existing.id) ? post : item
                )
                : [post, ...posts];

            if (savePosts(posts)) {
                location.href = "dashboard.html";
            } else {
                message.textContent =
                    "Unable to save the post. Check browser storage.";
                message.className = "message error";
            }
        });
    }

    function initializeDashboard() {
        const search = document.getElementById("search");
        const welcome = document.getElementById("welcomeTitle");

        if (search) {
            search.addEventListener("input", renderDashboard);
        }

        if (welcome) {
            try {
                const profile = JSON.parse(
                    localStorage.getItem(PROFILE_KEY)
                );

                if (profile && profile.name) {
                    welcome.textContent = "Welcome, " + profile.name + "!";
                }
            } catch (error) {
                // Keep the default heading.
            }
        }

        renderDashboard();
    }

    return {
        getPosts,
        savePosts,
        initializeHomeSearch,
        renderHomePosts,
        renderDashboard,
        initializePasswordToggle,
        initializeRegistration,
        initializeCreateBlog,
        initializeDashboard
    };
})();

// Initialize only the feature belonging to the current page.
document.addEventListener("DOMContentLoaded", () => {
    BlogSpace.initializePasswordToggle();
    BlogSpace.initializeRegistration();
    BlogSpace.initializeCreateBlog();
    BlogSpace.initializeDashboard();

    if (document.getElementById("searchInput")) {
        BlogSpace.initializeHomeSearch();
    }
});
