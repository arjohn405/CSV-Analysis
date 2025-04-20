module.exports = {

"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/util [external] (util, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/path [external] (path, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}}),
"[externals]/http [external] (http, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/url [external] (url, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}}),
"[externals]/fs [external] (fs, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/crypto [external] (crypto, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}}),
"[externals]/assert [external] (assert, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}}),
"[externals]/tty [external] (tty, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}}),
"[externals]/os [external] (os, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[externals]/events [external] (events, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}}),
"[project]/src/services/api.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__),
    "deleteCSVFile": (()=>deleteCSVFile),
    "getColumnVisualization": (()=>getColumnVisualization),
    "getCorrelation": (()=>getCorrelation),
    "getFileMetadata": (()=>getFileMetadata),
    "getFileStats": (()=>getFileStats),
    "getUploadedFiles": (()=>getUploadedFiles),
    "uploadCSV": (()=>uploadCSV)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
;
const API_URL = 'http://localhost:8000';
// Create axios instance with retry configuration
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});
// Add request interceptor for logging
api.interceptors.request.use((config)=>{
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
}, (error)=>{
    console.error('API Request Error:', error);
    return Promise.reject(error);
});
// Add response interceptor for better error handling
api.interceptors.response.use((response)=>response, async (error)=>{
    // Create a more user-friendly error message
    const errorMessage = getErrorMessage(error);
    console.error('API Response Error:', errorMessage, error);
    // Attach user-friendly message to error
    if (error.response) {
        error.userMessage = errorMessage;
    }
    return Promise.reject(error);
});
// Helper function to get a user-friendly error message
const getErrorMessage = (error)=>{
    if (error.message === 'Network Error') {
        return 'Cannot connect to the server. Please check if the backend is running (port 8000).';
    }
    if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        if (status === 404) {
            return 'The requested resource was not found.';
        } else if (status === 500) {
            return 'Server error. Please try again later.';
        } else {
            return `Error: ${error.response.data.detail || error.message}`;
        }
    }
    if (error.request) {
        // Request was made but no response received
        return 'No response from server. Please check your connection.';
    }
    // Something else caused the error
    return error.message || 'An unknown error occurred';
};
/**
 * Generic API request function with retry logic
 */ const apiRequest = async (request, retries = 2)=>{
    try {
        return await request();
    } catch (error) {
        if (retries > 0 && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isAxiosError(error) && (error.message === 'Network Error' || error.code === 'ECONNABORTED')) {
            console.log(`Retrying... (${retries} attempts left)`);
            await new Promise((resolve)=>setTimeout(resolve, 1000)); // Wait 1 second
            return apiRequest(request, retries - 1);
        }
        throw error;
    }
};
const uploadCSV = async (file)=>{
    return apiRequest(async ()=>{
        const formData = new FormData();
        formData.append('file', file);
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    });
};
const getUploadedFiles = async ()=>{
    return apiRequest(async ()=>{
        const response = await api.get('/files');
        return response.data;
    });
};
const getFileMetadata = async (fileId)=>{
    return apiRequest(async ()=>{
        const response = await api.get(`/files/${fileId}`);
        return response.data;
    });
};
const getFileStats = async (fileId)=>{
    return apiRequest(async ()=>{
        const response = await api.get(`/files/${fileId}/stats`);
        return response.data;
    });
};
const getColumnVisualization = async (fileId, column)=>{
    return apiRequest(async ()=>{
        const response = await api.get(`/files/${fileId}/visualizations/${column}`);
        return response.data;
    });
};
const getCorrelation = async (fileId)=>{
    return apiRequest(async ()=>{
        if (!fileId) {
            throw new Error('File ID is required for correlation analysis');
        }
        // Log the request URL for debugging
        const requestUrl = `${API_URL}/files/${fileId}/correlation`;
        console.log(`Making correlation request to: ${requestUrl}`);
        try {
            const response = await api.get(requestUrl);
            return response.data;
        } catch (error) {
            console.error(`Correlation request failed for file ID: ${fileId}`, error);
            throw error;
        }
    });
};
const deleteCSVFile = async (fileId)=>{
    return apiRequest(async ()=>{
        if (!fileId) {
            throw new Error('File ID is required for deletion');
        }
        const requestUrl = `${API_URL}/files/${fileId}`;
        console.log(`Deleting file: ${requestUrl}`);
        try {
            await api.delete(requestUrl);
            return;
        } catch (error) {
            console.error(`Delete request failed for file ID: ${fileId}`, error);
            throw error;
        }
    });
};
const __TURBOPACK__default__export__ = api;
}}),
"[project]/src/context/CSVContext.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "CSVProvider": (()=>CSVProvider),
    "useCSV": (()=>useCSV)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const CSVContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function CSVProvider({ children }) {
    const [files, setFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedFileId, setSelectedFileId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const refreshFiles = async ()=>{
        try {
            setLoading(true);
            setError(null);
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUploadedFiles"])();
            setFiles(data);
        } catch (error) {
            console.error('Error fetching files:', error);
            setError('Failed to load files. Please try again.');
        } finally{
            setLoading(false);
        }
    };
    const selectFile = (fileId)=>{
        if (!fileId) {
            console.error("Cannot select file: No file ID provided");
            return;
        }
        // Check if the file ID exists in our files list
        const fileExists = files.some((file)=>file.file_id === fileId);
        if (!fileExists && files.length > 0) {
            console.warn(`File ID ${fileId} was not found in the current files list. Available files:`, files.map((f)=>({
                    id: f.file_id,
                    name: f.filename
                })));
        }
        console.log(`Selecting file ID: ${fileId}`);
        setSelectedFileId(fileId);
    };
    const clearSelectedFile = ()=>{
        setSelectedFileId(null);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        refreshFiles();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CSVContext.Provider, {
        value: {
            files,
            selectedFileId,
            loading,
            error,
            refreshFiles,
            selectFile,
            clearSelectedFile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/CSVContext.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
function useCSV() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CSVContext);
    if (context === undefined) {
        throw new Error('useCSV must be used within a CSVProvider');
    }
    return context;
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__544fa927._.js.map