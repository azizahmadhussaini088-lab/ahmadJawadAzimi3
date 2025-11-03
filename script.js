// ----------------------
// 🗂️ Load Posts
// ----------------------
let posts = JSON.parse(localStorage.getItem("posts")) || [];

// Utility: Show notification toast
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => toast.classList.remove("show"), 2500);
  setTimeout(() => toast.remove(), 3000);
}

// ----------------------
// ✍️ Blog Page (blog.html)
// ----------------------
const form = document.getElementById("postForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const imageInput = document.getElementById("image"); // 📸 ورودی عکس
const cancelBtn = document.getElementById("cancelBtn");
const publishBtn = document.getElementById("publishBtn");

let editId = null;

// ----------------------
// 📦 ذخیره پست در LocalStorage
// ----------------------
function savePost(imageData = "") {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    showToast("⚠️ Please fill in all fields!", "warning");
    return;
  }

  if (editId) {
    // ✏️ Update post
    const index = posts.findIndex((p) => p.id === editId);
    posts[index].title = title;
    posts[index].content = content;
    posts[index].image = imageData || posts[index].image;
    posts[index].date = new Date().toLocaleString();
    showToast("✅ Post updated successfully!", "success");
    editId = null;
  } else {
    // 📝 New post
    const newPost = {
      id: Date.now(),
      title,
      content,
      image: imageData, // 📸 تصویر ذخیره می‌شود
      date: new Date().toLocaleString(),
    };
    posts.push(newPost);
    showToast("📝 Post published successfully!", "success");
  }

  localStorage.setItem("posts", JSON.stringify(posts));
  setTimeout(() => (window.location.href = "index.html"), 900);
}

// ----------------------
// 📃 صفحه ایجاد پست (blog.html)
// ----------------------
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (imageInput && imageInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function (e) {
        savePost(e.target.result); // ذخیره تصویر به صورت Base64
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      savePost(); // بدون تصویر
    }
  });

  // ❌ Cancel
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    titleInput.value = "";
    contentInput.value = "";
    if (imageInput) imageInput.value = "";
    showToast("❌ Post creation canceled", "info");
  });

  // ✏️ Edit Mode (load existing post)
  const urlParams = new URLSearchParams(window.location.search);
  const editPostId = urlParams.get("edit");
  if (editPostId) {
    const post = posts.find((p) => p.id == editPostId);
    if (post) {
      titleInput.value = post.title;
      contentInput.value = post.content;
      editId = post.id;
      publishBtn.textContent = "Update Post";
    }
  }
}

// ----------------------
// 🏠 Home Page (index.html)
// ----------------------
const postList = document.getElementById("posts");
const searchInput = document.getElementById("search");

if (postList) {
  renderPosts(posts);

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      const filtered = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(keyword) ||
          p.content.toLowerCase().includes(keyword)
      );

      postList.classList.add("fade-out");
      setTimeout(() => {
        renderPosts(filtered);
        postList.classList.remove("fade-out");
      }, 200);
    });
  }
}

function renderPosts(data) {
  if (data.length === 0) {
    postList.innerHTML = "<p class='no-posts'>No posts found!</p>";
  } else {
    postList.innerHTML = data
      .map(
        (p) => `
      <div class="post fade-in" data-id="${p.id}">
        ${p.image ? `<img src="${p.image}" alt="${p.title}" class="post-img">` : ""}
        <h3>${p.title}</h3>
        <small>${p.date}</small>
        <p>${p.content}</p>
        <div class="actions">
          <button class="edit-btn" onclick="editPost(${p.id})">✏️ Edit</button>
          <button class="delete-btn" onclick="deletePost(${p.id})">🗑️ Delete</button>
        </div>
      </div>`
      )
      .join("");
  }
}

function editPost(id) {
  window.location.href = `blog.html?edit=${id}`;
}

function deletePost(id) {
  if (confirm("Are you sure you want to delete this post?")) {
    posts = posts.filter((p) => p.id !== id);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts(posts);
    showToast("🗑️ Post deleted!", "error");
  }
}

// ----------------------
// 🌙 Dark Mode
// ----------------------
const toggleBtn = document.getElementById("toggle-theme");

if (toggleBtn) {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark", savedTheme === "dark");
  toggleBtn.textContent =
    savedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

  toggleBtn.addEventListener("click", () => {
    document.body.classList.add("theme-transition");
    document.body.classList.toggle("dark");

    const theme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", theme);
    toggleBtn.textContent =
      theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

    setTimeout(() => document.body.classList.remove("theme-transition"), 600);
  });
}
