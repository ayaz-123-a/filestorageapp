import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000";
  const navigate = useNavigate();
  // const [directoryItems, setDirectoryItems] = useState([]);
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newname, setNewname] = useState("");
  const [newDirname, setNewDirname] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // In real app, this would use localStorage
    return false;
  });
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentRenameItem, setCurrentRenameItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const { dirId } = useParams();
  const [name, setName] = useState("");
  const fetchName = async () => {
    const response = await fetch(`${BASE_URL}/user`, {
      credentials: "include",
    });
    const data = await response.json();
    setName(data.name);
  };
  useEffect(() => {
    fetchName();
  }, []);

  // Custom toast system
  const showToast = (
    message,
    type = "info",
    duration = 3000,
    buttons = null
  ) => {
    const id = Date.now();
    const toast = { id, message, type, buttons };
    setToasts((prev) => [...prev, toast]);

    if (!buttons && duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Dark mode toggle
  useEffect(() => {
    // In real app: localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  async function getDirectoryItems() {
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        credentials: "include",
      });
      if (response.status === 401) {
        navigate("/user/login");
        return;
      }
      const data = await response.json();
      setDirectoriesList(data.directories || []);
      setFilesList(data.files || []);
    } catch (error) {
      showToast("Failed to load directory items", "error");
    }
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirId]);

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/file/${dirId || ""}`, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("filename", file.name);

    xhr.addEventListener("load", () => {
      setUploading(false);
      setProgress(0);
      showToast(`File "${file.name}" uploaded successfully!`, "success");
      getDirectoryItems();
    });

    xhr.addEventListener("error", () => {
      setUploading(false);
      setProgress(0);
      showToast("Upload failed", "error");
    });

    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(2));
    });

    xhr.send(file);
    e.target.value = ""; // Reset file input
  }

  const confirmDelete = (type, id, name) => {
    showToast(`Delete "${name}"?`, "warning", 0, [
      {
        text: "Yes",
        action: () => {
          if (type === "file") {
            handleDeleteFile(id);
          } else {
            handleDeleteDirectory(id);
          }
        },
        className: "bg-red-500 hover:bg-red-600 text-white cursor-pointer",
      },
      {
        text: "No",
        action: () => {},
        className: "bg-gray-500 hover:bg-gray-600 text-white cursor-pointer",
      },
    ]);
  };

  async function handleDeleteFile(fileId) {
    try {
      const response = await fetch(`${BASE_URL}/file/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await response.text();
      showToast("File deleted successfully!", "success");
      getDirectoryItems();
    } catch (error) {
      showToast("Failed to delete file", "error");
    }
  }

  async function handleDeleteDirectory(dirId) {
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await response.text();
      showToast("Folder deleted successfully!", "success");
      getDirectoryItems();
    } catch (error) {
      showToast("Failed to delete folder", "error");
    }
  }

  const handleRename = (item, type) => {
    setCurrentRenameItem({ ...item, type });
    setNewname(item.name || "");
    setShowRenameModal(true);
  };

  const confirmRename = () => {
    showToast(`Rename to ${newname}`, "warning", 0, [
      {
        text: "Yes",
        action: () => {
          if (currentRenameItem.type === "file") {
            saveFilename(currentRenameItem.id);
          } else {
            saveDirectoryName(currentRenameItem.id);
          }
        },
        className: "bg-blue-500 hover:bg-blue-600 text-white",
      },
      {
        text: "No",
        action: () => {},
        className: "bg-gray-500 hover:bg-gray-600 text-white",
      },
    ]);
  };

  async function saveFilename(fileId) {
    try {
      const response = await fetch(`${BASE_URL}/file/${fileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ newname }),
      });
      await response.text();
      showToast("File renamed successfully!", "success");
      setNewname("");
      setShowRenameModal(false);
      getDirectoryItems();
    } catch (error) {
      showToast("Failed to rename file", "error");
    }
  }

  async function saveDirectoryName(dirId) {
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ newname }),
      });
      await response.text();
      showToast("Folder renamed successfully!", "success");
      setNewname("");
      setShowRenameModal(false);
      getDirectoryItems();
    } catch (error) {
      showToast("Failed to rename folder", "error");
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    try {
      const url = `${BASE_URL}/directory/${dirId || ""}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: newDirname }), // now in body
      });

      if (!response.ok) throw new Error("Failed to create folder");

      const createdDir = await response.json();

      showToast(`Folder "${createdDir.name}" created successfully!`, "success");
      setNewDirname("");
      setShowCreateFolderModal(false);

      // optional: instead of full refetch, you can just append createdDir to state
      getDirectoryItems();
    } catch (error) {
      showToast("Failed to create folder", "error");
    }
  }

  const handleDownload = (fileName) => {
    showToast(`Downloading "${fileName}"...`, "info");
  };

  // Toast Component
  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm rounded-lg shadow-lg p-4 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
              ? "bg-red-500 text-white"
              : toast.type === "warning"
              ? "bg-yellow-500 text-black"
              : "bg-blue-500 text-white"
          } animate-slide-in`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-lg font-bold opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
          {toast.buttons && (
            <div className="flex gap-2 mt-3">
              {toast.buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => {
                    button.action();
                    removeToast(toast.id);
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${button.className}`}
                >
                  {button.text}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
  const handleLogout = async () => {
    const response = await fetch(`${BASE_URL}/user/logout`, {
      method: "POST",
      credentials:"include"
    });
    if (response.ok) {
      showToast("Loggout Successfully");
      setTimeout(() => {
        navigate("/user/login");
      }, 500);
    }
  };
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CloudStorage
              </h1>
            </div>

            {/* Breadcrumb - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2 text-md bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <h1 className="typing-animation">
                {name ? `Hey ${name}` : "Please Login"}
              </h1>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDarkMode ? (
                  <svg
                    className="w-5 h-5 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {/* Auth buttons - Hidden on mobile */}
              <div className="hidden sm:flex space-x-2">
                <Link
                  to={"/user/login"}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Login</span>
                </Link>
                <Link
                  to={"/user/register"}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span>Sign Up</span>
                </Link>
                <button
                  onClick={async() => {
                    await handleLogout();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-400 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 16L21 12M21 12L17 8M21 12L7 12M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8"
                      stroke="#ffffff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 space-y-3">
            <Link
              to={"/user/login"}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors w-full"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Login</span>
            </Link>
            <Link
              to={"/user/register"}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors w-full cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span>Sign Up</span>
            </Link>
            <button
              onClick={async() => {
               await handleLogout();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors w-full cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17 16L21 12M21 12L17 8M21 12L7 12M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8"
                  stroke="#ffffff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Upload File</span>
                <input
                  type="file"
                  onChange={uploadFile}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create Folder</span>
              </button>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="w-full sm:w-64">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Files and Folders Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Files & Folders
            </h2>

            {directoriesList.length === 0 && filesList.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  No files or folders yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Directories */}
                {directoriesList.map(({ name, id }) => (
                  <div
                    key={id}
                    className="group bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                      </svg>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            handleRename({ name, id }, "directory")
                          }
                          className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors cursor-pointer"
                          title="Rename"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete("directory", id, name)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white truncate mb-2">
                      {name}
                    </h3>
                    <button
                      onClick={() => {
                        navigate(`/directory/${id}`);
                        showToast(`Navigate to directory: ${name}`, "info");
                      }}
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
                    >
                      Open →
                    </button>
                  </div>
                ))}

                {/* Files */}
                {filesList.map(({ name, id }) => (
                  <div
                    key={id}
                    className="group bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <svg
                        className="w-8 h-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRename({ name, id }, "file")}
                          className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                          title="Rename"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete("file", id, name)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white truncate mb-2">
                      {name}
                    </h3>
                    <div className="flex space-x-2 text-sm">
                      <a
                        href={`${BASE_URL}/file/${id}`}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                      <span className="text-gray-400">•</span>
                      <a
                        href={`${BASE_URL}/file/${id}?action=download`}
                        onClick={() => handleDownload(name)}
                        className="text-green-500 hover:text-green-600 font-medium flex items-center space-x-1"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Rename{" "}
                  {currentRenameItem?.type === "file" ? "File" : "Folder"}
                </h3>
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={newname}
                onChange={(e) => setNewname(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Enter new name..."
                autoFocus
              />
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={confirmRename}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Create New Folder
                </h3>
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={newDirname}
                onChange={(e) => setNewDirname(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Folder name..."
                autoFocus
              />
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateDirectory(e);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default DirectoryView;
