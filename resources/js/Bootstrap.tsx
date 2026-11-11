import axios from "axios";

// Global axios defaults — every `import axios from "axios"` in api/ shares this default instance.
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// VerifySso answers JSON requests with 409 "Session expired." + the SSO login URL once the session is
// gone; send the browser there instead of surfacing the 409 as an error toast.
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 409 && error.response?.data?.message === "Session expired.") {
            window.location.href = error.response.data.redirect || window.location.href;
            return new Promise(() => {});
        }
        return Promise.reject(error);
    },
);
