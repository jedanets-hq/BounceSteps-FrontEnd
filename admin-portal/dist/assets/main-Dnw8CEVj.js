var w=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var Z=w((X,m)=>{(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function a(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(n){if(n.ep)return;n.ep=!0;const r=a(n);fetch(n.href,r)}})();const d={API_BASE_URL:"https://isafarinetworkglobal-2.onrender.com/api",ENDPOINTS:{AUTH:{LOGIN:"/auth/login",LOGOUT:"/auth/logout",VERIFY:"/auth/verify",REFRESH:"/auth/refresh"},USERS:{ALL:"/admin/users",BY_ID:e=>`/admin/users/${e}`,TRAVELERS:"/admin/users?role=traveler",PROVIDERS:"/admin/users?role=service_provider",VERIFY:e=>`/admin/users/${e}/verify`,SUSPEND:e=>`/admin/users/${e}/suspend`,DELETE:e=>`/admin/users/${e}`,STATS:"/admin/users/stats",UPDATE_STATUS:e=>`/admin/users/${e}/status`},SERVICES:{ALL:"/admin/services",BY_ID:e=>`/admin/services/${e}`,PENDING:"/admin/services?status=pending",APPROVE:e=>`/admin/services/${e}/approve`,REJECT:e=>`/admin/services/${e}/reject`,DELETE:e=>`/admin/services/${e}`,STATS:"/admin/services/stats",CATEGORIES:"/admin/categories",DESTINATIONS:"/admin/destinations"},BOOKINGS:{ALL:"/admin/bookings",BY_ID:e=>`/admin/bookings/${e}`,PRE_ORDERS:"/admin/pre-orders",STATS:"/admin/bookings/stats",CALENDAR:"/admin/bookings/calendar",CANCEL:e=>`/admin/bookings/${e}/cancel`,REFUND:e=>`/admin/bookings/${e}/refund`},PAYMENTS:{ALL:"/admin/payments",BY_ID:e=>`/admin/payments/${e}`,TRANSACTIONS:"/admin/transactions",REVENUE:"/admin/revenue",PAYOUTS:"/admin/payouts",PENDING_PAYOUTS:"/admin/payouts/pending",PROCESS_PAYOUT:e=>`/admin/payouts/${e}/process`,STATS:"/admin/payments/stats"},REVIEWS:{ALL:"/admin/reviews",BY_ID:e=>`/admin/reviews/${e}`,PENDING:"/admin/reviews/pending",APPROVE:e=>`/admin/reviews/${e}/approve`,DELETE:e=>`/admin/reviews/${e}`,FEEDBACK:"/admin/feedback"},SUPPORT:{TICKETS:"/admin/support/tickets",BY_ID:e=>`/admin/support/tickets/${e}`,REPLY:e=>`/admin/support/tickets/${e}/reply`,CLOSE:e=>`/admin/support/tickets/${e}/close`,REPORTS:"/admin/reports",RESOLVE_REPORT:e=>`/admin/reports/${e}/resolve`},CONTENT:{PROMOTIONS:"/admin/promotions",CREATE_PROMOTION:"/admin/promotions/create",DELETE_PROMOTION:e=>`/admin/promotions/${e}`,NOTIFICATIONS:"/admin/notifications",SEND_NOTIFICATION:"/admin/notifications/send"},ANALYTICS:{DASHBOARD:"/admin/analytics/dashboard",USERS:"/admin/analytics/users",SERVICES:"/admin/analytics/services",BOOKINGS:"/admin/analytics/bookings",REVENUE:"/admin/analytics/revenue",TRENDS:"/admin/analytics/trends"},LOGS:{ALL:"/admin/logs",BY_USER:e=>`/admin/logs/user/${e}`,BY_ACTION:e=>`/admin/logs/action/${e}`,SYSTEM:"/admin/logs/system"},SETTINGS:{GET:"/admin/settings",UPDATE:"/admin/settings",ADMINS:"/admin/settings/admins",ADD_ADMIN:"/admin/settings/admins/add",REMOVE_ADMIN:e=>`/admin/settings/admins/${e}`,SYSTEM_HEALTH:"/admin/system/health"}},PAGINATION:{DEFAULT_PAGE:1,DEFAULT_LIMIT:20,MAX_LIMIT:100},STATUS:{USERS:["active","suspended","pending","deleted"],SERVICES:["pending","approved","rejected","inactive"],BOOKINGS:["pending","confirmed","completed","cancelled","refunded"],PAYMENTS:["pending","completed","failed","refunded"],TICKETS:["open","in-progress","resolved","closed"]},ROLES:{SUPER_ADMIN:"super_admin",ADMIN:"admin",MODERATOR:"moderator",SUPPORT:"support"},CATEGORIES:[{id:"Accommodation",name:"Accommodation",icon:"fa-hotel"},{id:"Transportation",name:"Transportation",icon:"fa-car"},{id:"Tours & Activities",name:"Tours & Activities",icon:"fa-hiking"},{id:"Food & Dining",name:"Food & Dining",icon:"fa-utensils"},{id:"Shopping",name:"Shopping",icon:"fa-shopping-bag"},{id:"Health & Wellness",name:"Health & Wellness",icon:"fa-heart"},{id:"Entertainment",name:"Entertainment",icon:"fa-music"}],CHART_COLORS:{primary:"#2C5F41",secondary:"#4A90A4",accent:"#D4A574",success:"#059669",warning:"#D97706",error:"#DC2626",info:"#3B82F6",gradient:{primary:["#2C5F41","#3A7A56"],secondary:["#4A90A4","#5BA5BA"],accent:["#D4A574","#E0B88A"]}},DATE_FORMATS:{DISPLAY:"MMM DD, YYYY",DISPLAY_TIME:"MMM DD, YYYY HH:mm",API:"YYYY-MM-DD",API_TIME:"YYYY-MM-DD HH:mm:ss"},STORAGE_KEYS:{AUTH_TOKEN:"isafari_admin_token",USER_DATA:"isafari_admin_user",THEME:"isafari_admin_theme",SIDEBAR_STATE:"isafari_admin_sidebar"},REFRESH_INTERVALS:{DASHBOARD:3e4,NOTIFICATIONS:6e4,SYSTEM_HEALTH:12e4},UPLOAD:{MAX_SIZE:5*1024*1024,ALLOWED_TYPES:["image/jpeg","image/png","image/webp","application/pdf"],ALLOWED_EXTENSIONS:[".jpg",".jpeg",".png",".webp",".pdf"]},NOTIFICATION_TYPES:{SUCCESS:"success",ERROR:"error",WARNING:"warning",INFO:"info"},LOG_ACTIONS:{USER_CREATED:"user_created",USER_UPDATED:"user_updated",USER_DELETED:"user_deleted",USER_VERIFIED:"user_verified",USER_SUSPENDED:"user_suspended",SERVICE_CREATED:"service_created",SERVICE_APPROVED:"service_approved",SERVICE_REJECTED:"service_rejected",SERVICE_DELETED:"service_deleted",BOOKING_CREATED:"booking_created",BOOKING_CANCELLED:"booking_cancelled",PAYMENT_PROCESSED:"payment_processed",PAYOUT_PROCESSED:"payout_processed",SETTINGS_UPDATED:"settings_updated"}};typeof m<"u"&&m.exports&&(m.exports=d);class C{constructor(){this.baseURL=d.API_BASE_URL,this.token=this.getToken()}getToken(){return localStorage.getItem(d.STORAGE_KEYS.AUTH_TOKEN)}setToken(t){localStorage.setItem(d.STORAGE_KEYS.AUTH_TOKEN,t),this.token=t}removeToken(){localStorage.removeItem(d.STORAGE_KEYS.AUTH_TOKEN),localStorage.removeItem(d.STORAGE_KEYS.USER_DATA),this.token=null}getHeaders(t=!0){const a={"Content-Type":"application/json"};return t&&this.token&&(a.Authorization=`Bearer ${this.token}`),a}async request(t,a={}){const s=`${this.baseURL}${t}`;console.log("API Request:",s);const n={...a,headers:{...this.getHeaders(a.auth!==!1),...a.headers}};try{const r=await fetch(s,n);console.log("API Response status:",r.status);const c=await r.json();if(console.log("API Response data:",c),!r.ok)throw new Error(c.message||"Request failed");return c}catch(r){throw console.error("API Error:",r),console.error("API Error details:",{url:s,message:r.message,stack:r.stack}),r}}async get(t,a={}){const s=new URLSearchParams(a).toString(),n=s?`${t}?${s}`:t;return this.request(n,{method:"GET"})}async post(t,a={}){return this.request(t,{method:"POST",body:JSON.stringify(a)})}async put(t,a={}){return this.request(t,{method:"PUT",body:JSON.stringify(a)})}async patch(t,a={}){return this.request(t,{method:"PATCH",body:JSON.stringify(a)})}async delete(t){return this.request(t,{method:"DELETE"})}async login(t,a){const s=await this.post(d.ENDPOINTS.AUTH.LOGIN,{email:t,password:a});return s.token&&(this.setToken(s.token),localStorage.setItem(d.STORAGE_KEYS.USER_DATA,JSON.stringify(s.user))),s}async logout(){try{await this.post(d.ENDPOINTS.AUTH.LOGOUT)}finally{this.removeToken()}}async verifyAuth(){return this.get(d.ENDPOINTS.AUTH.VERIFY)}async getAllUsers(t={}){return this.get(d.ENDPOINTS.USERS.ALL,t)}async getUserById(t){return this.get(d.ENDPOINTS.USERS.BY_ID(t))}async getTravelers(t={}){return this.get(d.ENDPOINTS.USERS.TRAVELERS,t)}async getProviders(t={}){return this.get(d.ENDPOINTS.USERS.PROVIDERS,t)}async verifyUser(t){return this.post(d.ENDPOINTS.USERS.VERIFY(t))}async suspendUser(t,a){return this.post(d.ENDPOINTS.USERS.SUSPEND(t),{reason:a})}async deleteUser(t){return this.delete(d.ENDPOINTS.USERS.DELETE(t))}async getUserStats(){return this.get(d.ENDPOINTS.USERS.STATS)}async getAllServices(t={}){return this.get(d.ENDPOINTS.SERVICES.ALL,t)}async getServiceById(t){return this.get(d.ENDPOINTS.SERVICES.BY_ID(t))}async getPendingServices(t={}){return this.get(d.ENDPOINTS.SERVICES.PENDING,t)}async approveService(t){return this.post(d.ENDPOINTS.SERVICES.APPROVE(t))}async rejectService(t,a){return this.post(d.ENDPOINTS.SERVICES.REJECT(t),{reason:a})}async deleteService(t){return this.delete(d.ENDPOINTS.SERVICES.DELETE(t))}async getServiceStats(){return this.get(d.ENDPOINTS.SERVICES.STATS)}async getCategories(){return this.get(d.ENDPOINTS.SERVICES.CATEGORIES)}async getDestinations(){return this.get(d.ENDPOINTS.SERVICES.DESTINATIONS)}async getAllBookings(t={}){return this.get(d.ENDPOINTS.BOOKINGS.ALL,t)}async getBookingById(t){return this.get(d.ENDPOINTS.BOOKINGS.BY_ID(t))}async getPreOrders(t={}){return this.get(d.ENDPOINTS.BOOKINGS.PRE_ORDERS,t)}async getBookingStats(){return this.get(d.ENDPOINTS.BOOKINGS.STATS)}async getBookingCalendar(t={}){return this.get(d.ENDPOINTS.BOOKINGS.CALENDAR,t)}async cancelBooking(t,a){return this.post(d.ENDPOINTS.BOOKINGS.CANCEL(t),{reason:a})}async refundBooking(t,a){return this.post(d.ENDPOINTS.BOOKINGS.REFUND(t),{amount:a})}async getAllPayments(t={}){return this.get(d.ENDPOINTS.PAYMENTS.ALL,t)}async getPaymentById(t){return this.get(d.ENDPOINTS.PAYMENTS.BY_ID(t))}async getTransactions(t={}){return this.get(d.ENDPOINTS.PAYMENTS.TRANSACTIONS,t)}async getRevenue(t={}){return this.get(d.ENDPOINTS.PAYMENTS.REVENUE,t)}async getPayouts(t={}){return this.get(d.ENDPOINTS.PAYMENTS.PAYOUTS,t)}async getPendingPayouts(){return this.get(d.ENDPOINTS.PAYMENTS.PENDING_PAYOUTS)}async processPayout(t){return this.post(d.ENDPOINTS.PAYMENTS.PROCESS_PAYOUT(t))}async getPaymentStats(){return this.get(d.ENDPOINTS.PAYMENTS.STATS)}async getAllReviews(t={}){return this.get(d.ENDPOINTS.REVIEWS.ALL,t)}async getReviewById(t){return this.get(d.ENDPOINTS.REVIEWS.BY_ID(t))}async getPendingReviews(){return this.get(d.ENDPOINTS.REVIEWS.PENDING)}async approveReview(t){return this.post(d.ENDPOINTS.REVIEWS.APPROVE(t))}async deleteReview(t){return this.delete(d.ENDPOINTS.REVIEWS.DELETE(t))}async getFeedback(t={}){return this.get(d.ENDPOINTS.REVIEWS.FEEDBACK,t)}async getSupportTickets(t={}){return this.get(d.ENDPOINTS.SUPPORT.TICKETS,t)}async getTicketById(t){return this.get(d.ENDPOINTS.SUPPORT.BY_ID(t))}async replyToTicket(t,a){return this.post(d.ENDPOINTS.SUPPORT.REPLY(t),{message:a})}async closeTicket(t){return this.post(d.ENDPOINTS.SUPPORT.CLOSE(t))}async getReports(t={}){return this.get(d.ENDPOINTS.SUPPORT.REPORTS,t)}async resolveReport(t,a){return this.post(d.ENDPOINTS.SUPPORT.RESOLVE_REPORT(t),{action:a})}async getPromotions(t={}){return this.get(d.ENDPOINTS.CONTENT.PROMOTIONS,t)}async createPromotion(t){return this.post(d.ENDPOINTS.CONTENT.CREATE_PROMOTION,t)}async deletePromotion(t){return this.delete(d.ENDPOINTS.CONTENT.DELETE_PROMOTION(t))}async getNotifications(t={}){return this.get(d.ENDPOINTS.CONTENT.NOTIFICATIONS,t)}async sendNotification(t){return this.post(d.ENDPOINTS.CONTENT.SEND_NOTIFICATION,t)}async getDashboardAnalytics(t={}){return this.get(d.ENDPOINTS.ANALYTICS.DASHBOARD,t)}async getUserAnalytics(t={}){return this.get(d.ENDPOINTS.ANALYTICS.USERS,t)}async getServiceAnalytics(t={}){return this.get(d.ENDPOINTS.ANALYTICS.SERVICES,t)}async getBookingAnalytics(t={}){return this.get(d.ENDPOINTS.ANALYTICS.BOOKINGS,t)}async getRevenueAnalytics(t={}){return this.get(d.ENDPOINTS.ANALYTICS.REVENUE,t)}async getTrends(t={}){return this.get(d.ENDPOINTS.ANALYTICS.TRENDS,t)}async getActivityLogs(t={}){return this.get(d.ENDPOINTS.LOGS.ALL,t)}async getUserLogs(t,a={}){return this.get(d.ENDPOINTS.LOGS.BY_USER(t),a)}async getActionLogs(t,a={}){return this.get(d.ENDPOINTS.LOGS.BY_ACTION(t),a)}async getSystemLogs(t={}){return this.get(d.ENDPOINTS.LOGS.SYSTEM,t)}async getSettings(){return this.get(d.ENDPOINTS.SETTINGS.GET)}async updateSettings(t){return this.put(d.ENDPOINTS.SETTINGS.UPDATE,t)}async getAdmins(){return this.get(d.ENDPOINTS.SETTINGS.ADMINS)}async addAdmin(t){return this.post(d.ENDPOINTS.SETTINGS.ADD_ADMIN,t)}async removeAdmin(t){return this.delete(d.ENDPOINTS.SETTINGS.REMOVE_ADMIN(t))}async getSystemHealth(){return this.get(d.ENDPOINTS.SETTINGS.SYSTEM_HEALTH)}}const l=new C,i={formatDate(e,t=!1){if(!e)return"-";const a=new Date(e),s={year:"numeric",month:"short",day:"numeric"};return t&&(s.hour="2-digit",s.minute="2-digit"),a.toLocaleDateString("en-US",s)},formatCurrency(e,t="TZS"){return e==null?"-":new Intl.NumberFormat("en-TZ",{style:"currency",currency:t,minimumFractionDigits:0,maximumFractionDigits:0}).format(e)},formatNumber(e){return e==null?"0":e.toLocaleString("en-US")},truncate(e,t=50){return e?e.length<=t?e:e.substring(0,t)+"...":""},timeAgo(e){if(!e)return"-";const t=new Date,a=new Date(e),s=Math.floor((t-a)/1e3),n={year:31536e3,month:2592e3,week:604800,day:86400,hour:3600,minute:60,second:1};for(const[r,c]of Object.entries(n)){const p=Math.floor(s/c);if(p>=1)return`${p} ${r}${p>1?"s":""} ago`}return"just now"},getStatusBadge(e){const a={active:{class:"success",icon:"check-circle",text:"Active"},suspended:{class:"danger",icon:"ban",text:"Suspended"},pending:{class:"warning",icon:"clock",text:"Pending"},deleted:{class:"muted",icon:"trash",text:"Deleted"},approved:{class:"success",icon:"check-circle",text:"Approved"},rejected:{class:"danger",icon:"times-circle",text:"Rejected"},inactive:{class:"muted",icon:"pause-circle",text:"Inactive"},confirmed:{class:"success",icon:"check",text:"Confirmed"},completed:{class:"info",icon:"check-double",text:"Completed"},cancelled:{class:"danger",icon:"times",text:"Cancelled"},refunded:{class:"warning",icon:"undo",text:"Refunded"},paid:{class:"success",icon:"check",text:"Paid"},failed:{class:"danger",icon:"times",text:"Failed"},processing:{class:"info",icon:"spinner",text:"Processing"},open:{class:"warning",icon:"envelope-open",text:"Open"},"in-progress":{class:"info",icon:"tasks",text:"In Progress"},resolved:{class:"success",icon:"check",text:"Resolved"},closed:{class:"muted",icon:"times",text:"Closed"}}[e==null?void 0:e.toLowerCase()]||{class:"muted",icon:"question",text:e};return`
            <span class="badge badge-${a.class}">
                <i class="fas fa-${a.icon}"></i>
                ${a.text}
            </span>
        `},getRoleBadge(e){const a={traveler:{class:"primary",icon:"user",text:"Traveler"},service_provider:{class:"secondary",icon:"briefcase",text:"Provider"},admin:{class:"danger",icon:"user-shield",text:"Admin"},super_admin:{class:"danger",icon:"crown",text:"Super Admin"}}[e]||{class:"muted",icon:"user",text:e};return`
            <span class="badge badge-${a.class}">
                <i class="fas fa-${a.icon}"></i>
                ${a.text}
            </span>
        `},showToast(e,t="info",a=3e3){const s=document.getElementById("toastContainer");if(!s)return;const n={success:"check-circle",error:"exclamation-circle",warning:"exclamation-triangle",info:"info-circle"},r=document.createElement("div");r.className=`toast toast-${t}`,r.innerHTML=`
            <i class="fas fa-${n[t]}"></i>
            <div class="toast-content">
                <div class="toast-message">${e}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `,s.appendChild(r),r.querySelector(".toast-close").addEventListener("click",()=>{r.remove()}),setTimeout(()=>{r.style.animation="slideOut 0.2s ease-out",setTimeout(()=>r.remove(),200)},a)},showConfirm(e,t,a,s=null){const n=document.getElementById("modalContainer");if(!n)return;const r=document.createElement("div");r.className="modal-overlay",r.innerHTML=`
            <div class="modal confirm-modal">
                <div class="modal-header">
                    <h3>${e}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${t}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline cancel-btn">Cancel</button>
                    <button class="btn btn-primary confirm-btn">Confirm</button>
                </div>
            </div>
        `,n.appendChild(r);const c=()=>{r.remove(),s&&s()};r.querySelector(".modal-close").addEventListener("click",c),r.querySelector(".cancel-btn").addEventListener("click",c),r.querySelector(".confirm-btn").addEventListener("click",()=>{r.remove(),a()}),r.addEventListener("click",p=>{p.target===r&&c()})},debounce(e,t=300){let a;return function(...n){const r=()=>{clearTimeout(a),e(...n)};clearTimeout(a),a=setTimeout(r,t)}},async copyToClipboard(e){try{await navigator.clipboard.writeText(e),this.showToast("Copied to clipboard","success")}catch{this.showToast("Failed to copy","error")}},downloadCSV(e,t){if(!e||e.length===0){this.showToast("No data to export","warning");return}const a=Object.keys(e[0]),s=[a.join(","),...e.map(p=>a.map(v=>{const u=p[v];return typeof u=="string"&&u.includes(",")?`"${u}"`:u}).join(","))].join(`
`),n=new Blob([s],{type:"text/csv"}),r=window.URL.createObjectURL(n),c=document.createElement("a");c.href=r,c.download=`${t}_${new Date().toISOString().split("T")[0]}.csv`,c.click(),window.URL.revokeObjectURL(r),this.showToast("CSV downloaded successfully","success")},isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)},isValidPhone(e){return/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(e)},generateId(){return Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15)},getPercentageChange(e,t){return!t||t===0?0:((e-t)/t*100).toFixed(1)},getTrendIndicator(e,t){const a=this.getPercentageChange(e,t),s=a>0;return a===0?'<span class="trend-neutral"><i class="fas fa-minus"></i> 0%</span>':`
            <span class="trend-${s?"up":"down"}">
                <i class="fas fa-arrow-${s?"up":"down"}"></i>
                ${Math.abs(a)}%
            </span>
        `},parseQueryParams(e=window.location.search){const t=new URLSearchParams(e),a={};for(const[s,n]of t)a[s]=n;return a},buildQueryString(e){return new URLSearchParams(e).toString()},sanitizeHTML(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML},getFileSize(e){if(e===0)return"0 Bytes";const t=1024,a=["Bytes","KB","MB","GB"],s=Math.floor(Math.log(e)/Math.log(t));return Math.round(e/Math.pow(t,s)*100)/100+" "+a[s]},hasPermission(e){const t=localStorage.getItem(d.STORAGE_KEYS.USER_DATA);if(!t)return!1;const a=JSON.parse(t),s={super_admin:4,admin:3,moderator:2,support:1};return s[a.role]>=s[e]},formatPhone(e){if(!e)return"-";const t=e.replace(/\D/g,"");return t.startsWith("255")?`+${t.slice(0,3)} ${t.slice(3,6)} ${t.slice(6,9)} ${t.slice(9)}`:e},getInitials(e){if(!e)return"?";const t=e.trim().split(" ");return t.length===1?t[0].charAt(0).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()},getAvatarUrl(e,t=null){if(t)return t;const a=this.getInitials(e);return`https://ui-avatars.com/api/?name=${encodeURIComponent(a)}&background=2C5F41&color=fff&size=128`}},o={statCard(e,t,a,s=null,n="primary"){const r=s?`
            <div class="stat-trend ${s.direction}">
                <i class="fas fa-arrow-${s.direction==="up"?"up":"down"}"></i>
                ${s.value}%
            </div>
        `:"";return`
            <div class="stat-card stat-card-${n}">
                <div class="stat-icon">
                    <i class="fas fa-${a}"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-title">${e}</div>
                    <div class="stat-value">${t}</div>
                    ${r}
                </div>
            </div>
        `},dataTable(e,t,a=null){const s=e.map(r=>`
            <th class="${r.sortable?"sortable":""}" data-key="${r.key}">
                ${r.label}
                ${r.sortable?'<i class="fas fa-sort"></i>':""}
            </th>
        `).join(""),n=t.map(r=>{const c=e.map(v=>{let u=r[v.key];return v.formatter&&(u=v.formatter(u,r)),`<td>${u||"-"}</td>`}).join(""),p=a?`
                <td class="table-actions">
                    ${a.map(v=>`
                        <button class="btn-icon btn-icon-${v.type}" 
                                data-action="${v.name}" 
                                data-id="${r.id}"
                                title="${v.label}">
                            <i class="fas fa-${v.icon}"></i>
                        </button>
                    `).join("")}
                </td>
            `:"";return`<tr data-id="${r.id}">${c}${p}</tr>`}).join("");return`
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${s}
                            ${a?'<th class="actions-column">Actions</th>':""}
                        </tr>
                    </thead>
                    <tbody>
                        ${n||'<tr><td colspan="100%" class="no-data">No data available</td></tr>'}
                    </tbody>
                </table>
            </div>
        `},pagination(e,t,a){if(t<=1)return"";const s=[],n=5;let r=Math.max(1,e-Math.floor(n/2)),c=Math.min(t,r+n-1);c-r<n-1&&(r=Math.max(1,c-n+1));for(let p=r;p<=c;p++)s.push(p);return`
            <div class="pagination">
                <button class="pagination-btn" 
                        data-page="${e-1}" 
                        ${e===1?"disabled":""}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${r>1?`
                    <button class="pagination-btn" data-page="1">1</button>
                    ${r>2?'<span class="pagination-dots">...</span>':""}
                `:""}
                
                ${s.map(p=>`
                    <button class="pagination-btn ${p===e?"active":""}" 
                            data-page="${p}">
                        ${p}
                    </button>
                `).join("")}
                
                ${c<t?`
                    ${c<t-1?'<span class="pagination-dots">...</span>':""}
                    <button class="pagination-btn" data-page="${t}">${t}</button>
                `:""}
                
                <button class="pagination-btn" 
                        data-page="${e+1}" 
                        ${e===t?"disabled":""}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `},filterBar(e){return`
            <div class="filter-bar">
                ${e.map(t=>{if(t.type==="search")return`
                            <div class="filter-item filter-search">
                                <i class="fas fa-search"></i>
                                <input type="text" 
                                       placeholder="${t.placeholder}" 
                                       data-filter="${t.key}">
                            </div>
                        `;if(t.type==="select")return`
                            <div class="filter-item filter-select">
                                <select data-filter="${t.key}">
                                    <option value="">${t.placeholder}</option>
                                    ${t.options.map(a=>`
                                        <option value="${a.value}">${a.label}</option>
                                    `).join("")}
                                </select>
                            </div>
                        `;if(t.type==="date")return`
                            <div class="filter-item filter-date">
                                <input type="date" 
                                       placeholder="${t.placeholder}" 
                                       data-filter="${t.key}">
                            </div>
                        `}).join("")}
                
                <button class="btn btn-outline filter-reset">
                    <i class="fas fa-redo"></i>
                    Reset
                </button>
            </div>
        `},chartContainer(e,t,a="line"){return`
            <div class="chart-container">
                <div class="chart-header">
                    <h3 class="chart-title">${t}</h3>
                    <div class="chart-controls">
                        <select class="chart-period" data-chart="${e}">
                            <option value="7">Last 7 days</option>
                            <option value="30" selected>Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>
                </div>
                <div class="chart-body">
                    <canvas id="${e}"></canvas>
                </div>
            </div>
        `},userCard(e){return`
            <div class="user-card" data-id="${e.id}">
                <div class="user-card-header">
                    <img src="${i.getAvatarUrl(e.name,e.avatar)}" 
                         alt="${e.name}" 
                         class="user-avatar">
                    <div class="user-info">
                        <h4 class="user-name">${e.name}</h4>
                        <p class="user-email">${e.email}</p>
                    </div>
                </div>
                <div class="user-card-body">
                    <div class="user-meta">
                        <div class="user-meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Joined ${i.formatDate(e.createdAt)}</span>
                        </div>
                        ${e.phone?`
                            <div class="user-meta-item">
                                <i class="fas fa-phone"></i>
                                <span>${i.formatPhone(e.phone)}</span>
                            </div>
                        `:""}
                    </div>
                    <div class="user-badges">
                        ${i.getRoleBadge(e.role)}
                        ${i.getStatusBadge(e.status)}
                    </div>
                </div>
                <div class="user-card-footer">
                    <button class="btn btn-sm btn-outline" data-action="view" data-id="${e.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-primary" data-action="edit" data-id="${e.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `},serviceCard(e){var t,a,s,n;return`
            <div class="service-card" data-id="${e.id}">
                <div class="service-image">
                    <img src="${((t=e.images)==null?void 0:t[0])||"/placeholder-service.jpg"}" 
                         alt="${e.title}">
                    ${e.featured?'<span class="service-featured"><i class="fas fa-star"></i> Featured</span>':""}
                </div>
                <div class="service-content">
                    <div class="service-header">
                        <h4 class="service-title">${i.truncate(e.title,40)}</h4>
                        <span class="service-price">${i.formatCurrency(e.price)}</span>
                    </div>
                    <p class="service-description">${i.truncate(e.description,80)}</p>
                    <div class="service-meta">
                        <span class="service-category">
                            <i class="fas fa-tag"></i>
                            ${e.category}
                        </span>
                        <span class="service-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${e.location}
                        </span>
                    </div>
                    <div class="service-footer">
                        <div class="service-provider">
                            <img src="${i.getAvatarUrl((a=e.provider)==null?void 0:a.name)}" 
                                 alt="${(s=e.provider)==null?void 0:s.name}" 
                                 class="provider-avatar">
                            <span>${(n=e.provider)==null?void 0:n.name}</span>
                        </div>
                        ${i.getStatusBadge(e.status)}
                    </div>
                </div>
                <div class="service-actions">
                    <button class="btn btn-sm btn-outline" data-action="view" data-id="${e.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${e.status==="pending"?`
                        <button class="btn btn-sm btn-success" data-action="approve" data-id="${e.id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" data-action="reject" data-id="${e.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    `:`
                        <button class="btn btn-sm btn-primary" data-action="edit" data-id="${e.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    `}
                </div>
            </div>
        `},bookingCard(e){var t,a,s;return`
            <div class="booking-card" data-id="${e.id}">
                <div class="booking-header">
                    <div class="booking-id">#${e.id.substring(0,8)}</div>
                    ${i.getStatusBadge(e.status)}
                </div>
                <div class="booking-content">
                    <div class="booking-service">
                        <h4>${(t=e.service)==null?void 0:t.title}</h4>
                        <p class="booking-category">
                            <i class="fas fa-tag"></i>
                            ${(a=e.service)==null?void 0:a.category}
                        </p>
                    </div>
                    <div class="booking-details">
                        <div class="booking-detail">
                            <i class="fas fa-user"></i>
                            <span>${(s=e.traveler)==null?void 0:s.name}</span>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-calendar"></i>
                            <span>${i.formatDate(e.date)}</span>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-users"></i>
                            <span>${e.guests} guest${e.guests>1?"s":""}</span>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-money-bill"></i>
                            <span>${i.formatCurrency(e.totalAmount)}</span>
                        </div>
                    </div>
                </div>
                <div class="booking-footer">
                    <button class="btn btn-sm btn-outline" data-action="view" data-id="${e.id}">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${e.status==="pending"?`
                        <button class="btn btn-sm btn-danger" data-action="cancel" data-id="${e.id}">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    `:""}
                </div>
            </div>
        `},activityLogItem(e){var a;return`
            <div class="activity-log-item">
                <div class="activity-icon">
                    <i class="fas fa-${{user_created:"user-plus",user_updated:"user-edit",user_deleted:"user-times",service_created:"plus-circle",service_approved:"check-circle",service_rejected:"times-circle",booking_created:"calendar-plus",payment_processed:"credit-card"}[e.action]||"circle"}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-user">${((a=e.user)==null?void 0:a.name)||"System"}</span>
                        <span class="activity-action">${e.action.replace(/_/g," ")}</span>
                    </div>
                    <div class="activity-description">${e.description}</div>
                    <div class="activity-time">${i.timeAgo(e.createdAt)}</div>
                </div>
            </div>
        `},emptyState(e,t,a,s=null){return`
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-${e}"></i>
                </div>
                <h3 class="empty-title">${t}</h3>
                <p class="empty-message">${a}</p>
                ${s?`
                    <button class="btn btn-primary" data-action="${s.action}">
                        <i class="fas fa-${s.icon}"></i>
                        ${s.label}
                    </button>
                `:""}
            </div>
        `},loadingSpinner(e="Loading..."){return`
            <div class="loading-spinner">
                <div class="spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p>${e}</p>
            </div>
        `},modal(e,t,a,s=null,n="medium"){return`
            <div class="modal-overlay" id="${e}">
                <div class="modal modal-${n}">
                    <div class="modal-header">
                        <h3>${t}</h3>
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${a}
                    </div>
                    ${s?`
                        <div class="modal-footer">
                            ${s}
                        </div>
                    `:""}
                </div>
            </div>
        `},formField(e){const{type:t,name:a,label:s,placeholder:n,required:r,value:c,options:p}=e;let v="";return t==="select"?v=`
                <select name="${a}" ${r?"required":""}>
                    <option value="">${n||"Select..."}</option>
                    ${p.map(u=>`
                        <option value="${u.value}" ${c===u.value?"selected":""}>
                            ${u.label}
                        </option>
                    `).join("")}
                </select>
            `:t==="textarea"?v=`
                <textarea name="${a}" 
                          placeholder="${n||""}" 
                          ${r?"required":""}>${c||""}</textarea>
            `:v=`
                <input type="${t}" 
                       name="${a}" 
                       placeholder="${n||""}" 
                       value="${c||""}" 
                       ${r?"required":""}>
            `,`
            <div class="form-field">
                <label for="${a}">
                    ${s}
                    ${r?'<span class="required">*</span>':""}
                </label>
                ${v}
            </div>
        `}},y={charts:{},refreshInterval:null,async init(){await this.loadDashboardData(),this.setupEventListeners(),this.startAutoRefresh()},async loadDashboardData(){try{const e=document.getElementById("pageContent");e.innerHTML=o.loadingSpinner("Loading dashboard..."),console.log("Fetching dashboard analytics...");const t=await l.getDashboardAnalytics();if(console.log("Dashboard data received:",t),t&&t.success)this.renderDashboard(t);else throw new Error((t==null?void 0:t.message)||"Failed to load data")}catch(e){console.error("Error loading dashboard:",e);const t=document.getElementById("pageContent");t.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Dashboard</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${e.message||"Unable to connect to the server"}</p>
                    <button class="btn btn-primary" onclick="DashboardPage.loadDashboardData()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `,i.showToast("Failed to load dashboard data","error")}},renderDashboard(e){var a,s,n,r,c,p,v,u;const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="dashboard-page">
                <!-- Page Header -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Dashboard Overview</h1>
                        <p class="page-subtitle">Welcome back! Here's what's happening with iSafari today.</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="refreshDashboard">
                            <i class="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                        <button class="btn btn-primary" id="exportReport">
                            <i class="fas fa-download"></i>
                            Export Report
                        </button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="stats-grid">
                    ${o.statCard("Total Users",i.formatNumber(((a=e.stats)==null?void 0:a.totalUsers)||0),"users",{direction:"up",value:"12.5"},"primary")}
                    ${o.statCard("Active Services",i.formatNumber(((s=e.stats)==null?void 0:s.activeServices)||0),"concierge-bell",{direction:"up",value:"8.3"},"secondary")}
                    ${o.statCard("Total Bookings",i.formatNumber(((n=e.stats)==null?void 0:n.totalBookings)||0),"calendar-check",{direction:"up",value:"15.7"},"success")}
                    ${o.statCard("Revenue (MTD)",i.formatCurrency(((r=e.stats)==null?void 0:r.monthlyRevenue)||0),"dollar-sign",{direction:"up",value:"23.1"},"accent")}
                </div>

                <!-- Secondary Stats -->
                <div class="stats-grid stats-grid-secondary">
                    <div class="card">
                        <div class="card-body">
                            <div class="stat-mini">
                                <div class="stat-mini-icon stat-warning">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="stat-mini-content">
                                    <div class="stat-mini-label">Pending Approvals</div>
                                    <div class="stat-mini-value">${((c=e.stats)==null?void 0:c.pendingApprovals)||0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <div class="stat-mini">
                                <div class="stat-mini-icon stat-info">
                                    <i class="fas fa-user-plus"></i>
                                </div>
                                <div class="stat-mini-content">
                                    <div class="stat-mini-label">New Users (Today)</div>
                                    <div class="stat-mini-value">${((p=e.stats)==null?void 0:p.newUsersToday)||0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <div class="stat-mini">
                                <div class="stat-mini-icon stat-success">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="stat-mini-content">
                                    <div class="stat-mini-label">Completed Today</div>
                                    <div class="stat-mini-value">${((v=e.stats)==null?void 0:v.completedToday)||0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <div class="stat-mini">
                                <div class="stat-mini-icon stat-danger">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="stat-mini-content">
                                    <div class="stat-mini-label">Open Tickets</div>
                                    <div class="stat-mini-value">${((u=e.stats)==null?void 0:u.openTickets)||0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="dashboard-row">
                    <div class="dashboard-col-8">
                        <div class="card">
                            ${o.chartContainer("revenueChart","Revenue Overview","line")}
                        </div>
                    </div>
                    <div class="dashboard-col-4">
                        <div class="card">
                            ${o.chartContainer("bookingsChart","Bookings by Status","doughnut")}
                        </div>
                    </div>
                </div>

                <!-- Second Charts Row -->
                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            ${o.chartContainer("usersChart","User Growth","bar")}
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            ${o.chartContainer("servicesChart","Services by Category","pie")}
                        </div>
                    </div>
                </div>

                <!-- Recent Activity & Quick Actions -->
                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-history"></i>
                                    Recent Activity
                                </h3>
                                <a href="#activity-logs" class="btn btn-sm btn-outline">View All</a>
                            </div>
                            <div class="card-body">
                                <div class="activity-list" id="recentActivity">
                                    ${this.renderRecentActivity(e.recentActivity||[])}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-bell"></i>
                                    Pending Actions
                                </h3>
                            </div>
                            <div class="card-body">
                                <div class="pending-actions">
                                    ${this.renderPendingActions(e.pendingActions||{})}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Services & Top Providers -->
                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-star"></i>
                                    Top Performing Services
                                </h3>
                            </div>
                            <div class="card-body">
                                ${this.renderTopServices(e.topServices||[])}
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-trophy"></i>
                                    Top Service Providers
                                </h3>
                            </div>
                            <div class="card-body">
                                ${this.renderTopProviders(e.topProviders||[])}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Health -->
                <div class="dashboard-row">
                    <div class="dashboard-col-12">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-heartbeat"></i>
                                    System Health
                                </h3>
                            </div>
                            <div class="card-body">
                                ${this.renderSystemHealth(e.systemHealth||{})}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,this.initializeCharts(e)},renderRecentActivity(e){return!e||e.length===0?o.emptyState("history","No Recent Activity","Activity will appear here as it happens"):e.slice(0,10).map(t=>o.activityLogItem(t)).join("")},renderPendingActions(e){return[{icon:"user-check",label:"User Verifications",count:e.userVerifications||0,link:"#user-verification",color:"warning"},{icon:"check-circle",label:"Service Approvals",count:e.serviceApprovals||0,link:"#service-approval",color:"info"},{icon:"headset",label:"Support Tickets",count:e.supportTickets||0,link:"#support",color:"danger"},{icon:"money-bill-wave",label:"Pending Payouts",count:e.pendingPayouts||0,link:"#payouts",color:"success"}].map(a=>`
            <a href="${a.link}" class="pending-action-item">
                <div class="pending-action-icon pending-action-${a.color}">
                    <i class="fas fa-${a.icon}"></i>
                </div>
                <div class="pending-action-content">
                    <div class="pending-action-label">${a.label}</div>
                    <div class="pending-action-count">${a.count} pending</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </a>
        `).join("")},renderTopServices(e){return!e||e.length===0?'<p class="text-muted">No data available</p>':`
            <div class="top-items-list">
                ${e.slice(0,5).map((t,a)=>{var s;return`
                    <div class="top-item">
                        <div class="top-item-rank">#${a+1}</div>
                        <div class="top-item-content">
                            <div class="top-item-name">${i.truncate(t.title,40)}</div>
                            <div class="top-item-meta">
                                ${t.bookings} bookings • ${i.formatCurrency(t.revenue)} revenue
                            </div>
                        </div>
                        <div class="top-item-rating">
                            <i class="fas fa-star"></i>
                            ${((s=t.rating)==null?void 0:s.toFixed(1))||"N/A"}
                        </div>
                    </div>
                `}).join("")}
            </div>
        `},renderTopProviders(e){return!e||e.length===0?'<p class="text-muted">No data available</p>':`
            <div class="top-items-list">
                ${e.slice(0,5).map((t,a)=>`
                    <div class="top-item">
                        <div class="top-item-rank">#${a+1}</div>
                        <img src="${i.getAvatarUrl(t.name,t.avatar)}" 
                             alt="${t.name}" 
                             class="top-item-avatar">
                        <div class="top-item-content">
                            <div class="top-item-name">${t.name}</div>
                            <div class="top-item-meta">
                                ${t.services} services • ${t.bookings} bookings
                            </div>
                        </div>
                        <div class="top-item-revenue">
                            ${i.formatCurrency(t.revenue)}
                        </div>
                    </div>
                `).join("")}
            </div>
        `},renderSystemHealth(e){return`
            <div class="system-health-grid">
                ${[{label:"API Response Time",value:`${e.apiResponseTime||0}ms`,status:"good"},{label:"Database Status",value:e.databaseStatus||"Connected",status:"good"},{label:"Server Uptime",value:e.serverUptime||"99.9%",status:"good"},{label:"Active Sessions",value:e.activeSessions||0,status:"good"}].map(a=>`
                    <div class="health-metric">
                        <div class="health-metric-label">${a.label}</div>
                        <div class="health-metric-value">${a.value}</div>
                        <div class="health-metric-status health-${a.status}">
                            <i class="fas fa-circle"></i>
                            ${a.status}
                        </div>
                    </div>
                `).join("")}
            </div>
        `},initializeCharts(e){var t,a,s,n,r,c,p;this.charts.revenue=new Chart(document.getElementById("revenueChart"),{type:"line",data:{labels:((t=e.revenueData)==null?void 0:t.labels)||[],datasets:[{label:"Revenue",data:((a=e.revenueData)==null?void 0:a.values)||[],borderColor:d.CHART_COLORS.primary,backgroundColor:d.CHART_COLORS.primary+"20",tension:.4,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}}),this.charts.bookings=new Chart(document.getElementById("bookingsChart"),{type:"doughnut",data:{labels:["Confirmed","Pending","Completed","Cancelled"],datasets:[{data:((s=e.bookingsData)==null?void 0:s.values)||[0,0,0,0],backgroundColor:[d.CHART_COLORS.success,d.CHART_COLORS.warning,d.CHART_COLORS.info,d.CHART_COLORS.error]}]},options:{responsive:!0,maintainAspectRatio:!1}}),this.charts.users=new Chart(document.getElementById("usersChart"),{type:"bar",data:{labels:((n=e.usersData)==null?void 0:n.labels)||[],datasets:[{label:"New Users",data:((r=e.usersData)==null?void 0:r.values)||[],backgroundColor:d.CHART_COLORS.secondary}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}}),this.charts.services=new Chart(document.getElementById("servicesChart"),{type:"pie",data:{labels:((c=e.servicesData)==null?void 0:c.labels)||[],datasets:[{data:((p=e.servicesData)==null?void 0:p.values)||[],backgroundColor:[d.CHART_COLORS.primary,d.CHART_COLORS.secondary,d.CHART_COLORS.accent,d.CHART_COLORS.success,d.CHART_COLORS.warning,d.CHART_COLORS.info]}]},options:{responsive:!0,maintainAspectRatio:!1}})},setupEventListeners(){var e,t;(e=document.getElementById("refreshDashboard"))==null||e.addEventListener("click",()=>{this.loadDashboardData()}),(t=document.getElementById("exportReport"))==null||t.addEventListener("click",()=>{this.exportReport()})},startAutoRefresh(){this.refreshInterval=setInterval(()=>{this.loadDashboardData()},d.REFRESH_INTERVALS.DASHBOARD)},stopAutoRefresh(){this.refreshInterval&&clearInterval(this.refreshInterval)},async exportReport(){try{i.showToast("Generating report...","info"),i.showToast("Report exported successfully","success")}catch{i.showToast("Failed to export report","error")}},destroy(){this.stopAutoRefresh(),Object.values(this.charts).forEach(e=>{e&&e.destroy()}),this.charts={}}};window.DashboardPage=y;const g={users:[],currentPage:1,filters:{},async init(){await this.loadUsers(),this.setupEventListeners()},async loadUsers(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading users...");const a={page:e,limit:d.PAGINATION.DEFAULT_LIMIT,...this.filters};console.log("Fetching users...");const s=await l.getAllUsers(a);console.log("Users response:",s),this.users=s.users||[],this.currentPage=e,this.renderUsers(s)}catch(t){console.error("Error loading users:",t);const a=document.getElementById("pageContent");a.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Users</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${t.message||"Unable to connect to the server"}</p>
                    <button class="btn btn-primary" onclick="UsersPage.loadUsers()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `,i.showToast("Failed to load users","error")}},renderUsers(e){var a,s,n,r;const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="users-page">
                <!-- Page Header -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title">User Management</h1>
                        <p class="page-subtitle">Manage all travelers and service providers</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="exportUsers">
                            <i class="fas fa-download"></i>
                            Export
                        </button>
                        <button class="btn btn-primary" id="addUser">
                            <i class="fas fa-user-plus"></i>
                            Add User
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-grid stats-grid-4">
                    ${o.statCard("Total Users",i.formatNumber(((a=e.stats)==null?void 0:a.total)||0),"users",null,"primary")}
                    ${o.statCard("Travelers",i.formatNumber(((s=e.stats)==null?void 0:s.travelers)||0),"user-tie",null,"secondary")}
                    ${o.statCard("Providers",i.formatNumber(((n=e.stats)==null?void 0:n.providers)||0),"briefcase",null,"accent")}
                    ${o.statCard("Active Today",i.formatNumber(((r=e.stats)==null?void 0:r.activeToday)||0),"user-check",null,"success")}
                </div>

                <!-- Filters -->
                ${o.filterBar([{type:"search",key:"search",placeholder:"Search users..."},{type:"select",key:"role",placeholder:"All Roles",options:[{value:"traveler",label:"Travelers"},{value:"service_provider",label:"Service Providers"}]},{type:"select",key:"status",placeholder:"All Status",options:[{value:"active",label:"Active"},{value:"suspended",label:"Suspended"},{value:"pending",label:"Pending"}]},{type:"date",key:"dateFrom",placeholder:"From Date"},{type:"date",key:"dateTo",placeholder:"To Date"}])}

                <!-- Users Table -->
                <div class="card">
                    <div class="card-body">
                        ${this.renderUsersTable(this.users)}
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,c=>this.loadUsers(c))}
                </div>
            </div>
        `,this.attachTableEventListeners()},renderUsersTable(e){if(!e||e.length===0)return o.emptyState("users","No Users Found","No users match your current filters",{action:"addUser",icon:"user-plus",label:"Add User"});const t=[{key:"name",label:"User",sortable:!0,formatter:(s,n)=>`
                <div class="user-cell">
                    <img src="${i.getAvatarUrl(n.name,n.avatar)}" alt="${n.name}" class="user-cell-avatar">
                    <div class="user-cell-info">
                        <div class="user-cell-name">${n.name}</div>
                        <div class="user-cell-email">${n.email}</div>
                    </div>
                </div>
            `},{key:"phone",label:"Phone",sortable:!1,formatter:s=>i.formatPhone(s)},{key:"role",label:"Role",sortable:!0,formatter:s=>i.getRoleBadge(s)},{key:"status",label:"Status",sortable:!0,formatter:s=>i.getStatusBadge(s)},{key:"createdAt",label:"Joined",sortable:!0,formatter:s=>i.formatDate(s)},{key:"lastActive",label:"Last Active",sortable:!0,formatter:s=>i.timeAgo(s)}],a=[{name:"view",icon:"eye",label:"View Details",type:"info"},{name:"edit",icon:"edit",label:"Edit User",type:"primary"},{name:"verify",icon:"check-circle",label:"Verify",type:"success"},{name:"suspend",icon:"ban",label:"Block User",type:"warning"},{name:"unblock",icon:"unlock",label:"Unblock",type:"secondary"},{name:"delete",icon:"trash",label:"Delete Permanently",type:"danger"}];return o.dataTable(t,e,a)},attachTableEventListeners(){document.querySelectorAll("[data-action]").forEach(e=>{e.addEventListener("click",t=>{const a=t.currentTarget.dataset.action,s=t.currentTarget.dataset.id;switch(a){case"view":this.viewUser(s);break;case"edit":this.editUser(s);break;case"verify":this.verifyUser(s);break;case"suspend":this.suspendUser(s);break;case"unblock":this.unblockUser(s);break;case"delete":this.deleteUser(s);break;case"addUser":this.showAddUserModal();break}})}),document.querySelectorAll(".pagination-btn").forEach(e=>{e.addEventListener("click",t=>{const a=parseInt(t.currentTarget.dataset.page);a&&a!==this.currentPage&&this.loadUsers(a)})})},setupEventListeners(){document.addEventListener("click",e=>{e.target.closest("#exportUsers")&&this.exportUsers(),e.target.closest("#addUser")&&this.showAddUserModal()}),document.addEventListener("change",e=>{e.target.dataset.filter&&(this.filters[e.target.dataset.filter]=e.target.value,this.loadUsers(1))}),document.addEventListener("input",i.debounce(e=>{e.target.dataset.filter==="search"&&(this.filters.search=e.target.value,this.loadUsers(1))},500)),document.addEventListener("click",e=>{e.target.closest(".filter-reset")&&(this.filters={},document.querySelectorAll("[data-filter]").forEach(t=>{t.value=""}),this.loadUsers(1))})},async viewUser(e){try{const t=await l.getUserById(e);this.showUserDetailsModal(t)}catch{i.showToast("Failed to load user details","error")}},showUserDetailsModal(e){var n,r,c;const t=`
            <div class="user-details">
                <div class="user-details-header">
                    <img src="${i.getAvatarUrl(e.name,e.avatar)}" alt="${e.name}" class="user-details-avatar">
                    <div>
                        <h3>${e.name}</h3>
                        <p>${e.email}</p>
                    </div>
                </div>
                <div class="user-details-body">
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${i.formatPhone(e.phone)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Role:</span>
                        <span class="detail-value">${i.getRoleBadge(e.role)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${i.getStatusBadge(e.status)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Joined:</span>
                        <span class="detail-value">${i.formatDate(e.createdAt,!0)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Last Active:</span>
                        <span class="detail-value">${i.timeAgo(e.lastActive)}</span>
                    </div>
                    ${e.role==="service_provider"?`
                        <div class="detail-row">
                            <span class="detail-label">Services:</span>
                            <span class="detail-value">${((n=e.stats)==null?void 0:n.totalServices)||0}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Bookings:</span>
                            <span class="detail-value">${((r=e.stats)==null?void 0:r.totalBookings)||0}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Revenue:</span>
                            <span class="detail-value">${i.formatCurrency(((c=e.stats)==null?void 0:c.totalRevenue)||0)}</span>
                        </div>
                    `:""}
                </div>
            </div>
        `,a=o.modal("userDetailsModal","User Details",t,`
            <button class="btn btn-outline modal-close-btn">Close</button>
            <button class="btn btn-primary" onclick="UsersPage.editUser('${e.id}')">Edit User</button>
        `),s=document.getElementById("modalContainer");s.innerHTML=a,s.querySelector(".modal-close").addEventListener("click",()=>{s.innerHTML=""}),s.querySelector(".modal-close-btn").addEventListener("click",()=>{s.innerHTML=""})},editUser(e){i.showToast("Edit user functionality coming soon","info")},async suspendUser(e){i.showConfirm("Block/Suspend User","Are you sure you want to block this user? They will not be able to access their account until unblocked.",async()=>{try{await l.suspendUser(e,"Blocked by admin"),i.showToast("User blocked successfully","success"),this.loadUsers(this.currentPage)}catch{i.showToast("Failed to block user","error")}})},async unblockUser(e){i.showConfirm("Unblock User","Are you sure you want to unblock this user? They will regain access to their account.",async()=>{try{await l.put(`/admin/users/${e}/status`,{isActive:!0}),i.showToast("User unblocked successfully","success"),this.loadUsers(this.currentPage)}catch{i.showToast("Failed to unblock user","error")}})},async deleteUser(e){i.showConfirm("Delete User Permanently","WARNING: This will permanently delete this user and all their data including services, bookings, and reviews. This action CANNOT be undone!",async()=>{try{await l.deleteUser(e),i.showToast("User deleted permanently","success"),this.loadUsers(this.currentPage)}catch{i.showToast("Failed to delete user","error")}})},async verifyUser(e){i.showConfirm("Verify User","Are you sure you want to verify this user?",async()=>{try{await l.verifyUser(e),i.showToast("User verified successfully","success"),this.loadUsers(this.currentPage)}catch{i.showToast("Failed to verify user","error")}})},showAddUserModal(){i.showToast("Add user functionality coming soon","info")},exportUsers(){const e=this.users.map(t=>({Name:t.name,Email:t.email,Phone:t.phone,Role:t.role,Status:t.status,Joined:i.formatDate(t.createdAt)}));i.downloadCSV(e,"isafari_users")},destroy(){}},A={async init(){await g.init(),g.filters={role:"traveler"},await g.loadUsers()},destroy(){g.destroy()}},I={async init(){await g.init(),g.filters={role:"service_provider"},await g.loadUsers()},destroy(){g.destroy()}},b={services:[],currentPage:1,filters:{},async init(){await this.loadServices(),this.setupEventListeners()},async loadServices(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading services...");const a={page:e,limit:d.PAGINATION.DEFAULT_LIMIT,...this.filters};console.log("Fetching services...");const s=await l.getAllServices(a);console.log("Services response:",s),this.services=s.services||[],this.currentPage=e,this.renderServices(s)}catch(t){console.error("Error loading services:",t);const a=document.getElementById("pageContent");a.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Services</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${t.message||"Unable to connect to the server"}</p>
                    <button class="btn btn-primary" onclick="ServicesPage.loadServices()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `,i.showToast("Failed to load services","error")}},renderServices(e){var a,s,n,r;const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="services-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Service Management</h1>
                        <p class="page-subtitle">Manage all services across iSafari</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="exportServices">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>

                <div class="stats-grid stats-grid-4">
                    ${o.statCard("Total Services",i.formatNumber(((a=e.stats)==null?void 0:a.total)||0),"concierge-bell",null,"primary")}
                    ${o.statCard("Active",i.formatNumber(((s=e.stats)==null?void 0:s.active)||0),"check-circle",null,"success")}
                    ${o.statCard("Pending",i.formatNumber(((n=e.stats)==null?void 0:n.pending)||0),"clock",null,"warning")}
                    ${o.statCard("Inactive",i.formatNumber(((r=e.stats)==null?void 0:r.inactive)||0),"pause-circle",null,"muted")}
                </div>

                ${o.filterBar([{type:"search",key:"search",placeholder:"Search services..."},{type:"select",key:"category",placeholder:"All Categories",options:d.CATEGORIES.map(c=>({value:c.id,label:c.name}))},{type:"select",key:"status",placeholder:"All Status",options:d.STATUS.SERVICES.map(c=>({value:c,label:c.charAt(0).toUpperCase()+c.slice(1)}))}])}

                <div class="services-grid">
                    ${this.renderServicesGrid(this.services)}
                </div>

                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,c=>this.loadServices(c))}
                </div>
            </div>
        `,this.attachEventListeners()},renderServicesGrid(e){return!e||e.length===0?o.emptyState("concierge-bell","No Services Found","No services match your current filters"):e.map(t=>o.serviceCard(t)).join("")},attachEventListeners(){document.querySelectorAll("[data-action]").forEach(e=>{e.addEventListener("click",t=>{const a=t.currentTarget.dataset.action,s=t.currentTarget.dataset.id;switch(a){case"view":this.viewService(s);break;case"edit":this.editService(s);break;case"approve":this.approveService(s);break;case"reject":this.rejectService(s);break;case"deactivate":this.deactivateService(s);break;case"delete":this.deleteService(s);break}})})},setupEventListeners(){document.addEventListener("change",e=>{e.target.dataset.filter&&(this.filters[e.target.dataset.filter]=e.target.value,this.loadServices(1))}),document.addEventListener("input",i.debounce(e=>{e.target.dataset.filter==="search"&&(this.filters.search=e.target.value,this.loadServices(1))},500))},async viewService(e){try{const t=await l.getServiceById(e),a=t.service||t;this.showServiceDetailsModal(a)}catch{i.showToast("Failed to load service","error")}},showServiceDetailsModal(e){var s,n,r,c;const t=`
            <div class="service-details">
                <div class="service-details-header">
                    <img src="${((s=e.images)==null?void 0:s[0])||"/placeholder-service.jpg"}" alt="${e.title}" class="service-details-image" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
                    <h3 style="margin-top: 16px;">${e.title}</h3>
                    <p style="color: var(--color-muted-foreground);">${e.category}</p>
                </div>
                <div class="service-details-body" style="margin-top: 16px;">
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Price:</span>
                        <span class="detail-value" style="font-weight: 600;">TZS ${i.formatNumber(e.price||0)}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${e.location||"N/A"}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Provider:</span>
                        <span class="detail-value">${e.business_name||((n=e.provider)==null?void 0:n.name)||"N/A"}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${e.is_active?'<span style="color: var(--color-success);">Active</span>':'<span style="color: var(--color-warning);">Inactive</span>'}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Rating:</span>
                        <span class="detail-value">${e.average_rating||0} ⭐</span>
                    </div>
                    <div class="detail-row" style="padding: 8px 0;">
                        <span class="detail-label">Description:</span>
                        <p style="margin-top: 8px; color: var(--color-muted-foreground);">${e.description||"No description"}</p>
                    </div>
                </div>
            </div>
        `,a=document.getElementById("modalContainer")||this.createModalContainer();a.innerHTML=o.modal("serviceDetailsModal","Service Details",t,`
            <button class="btn btn-outline modal-close-btn">Close</button>
            <button class="btn btn-success" onclick="ServicesPage.approveService('${e.id}')">Approve</button>
            <button class="btn btn-warning" onclick="ServicesPage.deactivateService('${e.id}')">Deactivate</button>
            <button class="btn btn-danger" onclick="ServicesPage.deleteService('${e.id}')">Delete</button>
        `),(r=a.querySelector(".modal-close"))==null||r.addEventListener("click",()=>a.innerHTML=""),(c=a.querySelector(".modal-close-btn"))==null||c.addEventListener("click",()=>a.innerHTML="")},createModalContainer(){const e=document.createElement("div");return e.id="modalContainer",document.body.appendChild(e),e},editService(e){i.showToast("Edit service - redirecting to service management","info")},async approveService(e){i.showConfirm("Approve Service","Are you sure you want to approve this service? It will become visible to travelers.",async()=>{try{await l.approveService(e),i.showToast("Service approved successfully","success"),document.getElementById("modalContainer").innerHTML="",this.loadServices(this.currentPage)}catch{i.showToast("Failed to approve service","error")}})},async rejectService(e){i.showConfirm("Reject Service","Are you sure you want to reject this service?",async()=>{try{await l.rejectService(e,"Rejected by admin"),i.showToast("Service rejected","success"),document.getElementById("modalContainer").innerHTML="",this.loadServices(this.currentPage)}catch{i.showToast("Failed to reject service","error")}})},async deactivateService(e){i.showConfirm("Deactivate Service","Are you sure you want to deactivate this service? It will be hidden from travelers.",async()=>{try{await l.rejectService(e,"Deactivated by admin"),i.showToast("Service deactivated","success"),document.getElementById("modalContainer").innerHTML="",this.loadServices(this.currentPage)}catch{i.showToast("Failed to deactivate service","error")}})},async deleteService(e){i.showConfirm("Delete Service Permanently","WARNING: This will permanently delete this service and all related bookings. This action CANNOT be undone!",async()=>{try{await l.deleteService(e),i.showToast("Service deleted permanently","success"),document.getElementById("modalContainer").innerHTML="",this.loadServices(this.currentPage)}catch{i.showToast("Failed to delete service","error")}})},destroy(){}};window.ServicesPage=b;const f={services:[],currentPage:1,async init(){await this.loadPendingServices(),this.setupEventListeners()},async loadPendingServices(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading pending services...");const a={page:e,limit:d.PAGINATION.DEFAULT_LIMIT,status:"pending"};console.log("Fetching pending services...");const s=await l.getAllServices(a);console.log("Pending services response:",s),this.services=s.services||[],this.currentPage=e,this.renderPendingServices(s)}catch(t){console.error("Error loading pending services:",t);const a=document.getElementById("pageContent");a.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Pending Services</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${t.message||"Unable to connect to the server"}</p>
                    <button class="btn btn-primary" onclick="ServiceApprovalPage.loadPendingServices()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `,i.showToast("Failed to load pending services","error")}},renderPendingServices(e){var a,s,n;const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="services-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Pending Service Approvals</h1>
                        <p class="page-subtitle">Review and approve new services submitted by providers</p>
                    </div>
                </div>

                <div class="stats-grid stats-grid-3">
                    ${o.statCard("Pending",i.formatNumber(((a=e.stats)==null?void 0:a.pending)||0),"clock",null,"warning")}
                    ${o.statCard("Total Services",i.formatNumber(((s=e.stats)==null?void 0:s.total)||0),"concierge-bell",null,"primary")}
                    ${o.statCard("Active",i.formatNumber(((n=e.stats)==null?void 0:n.active)||0),"check-circle",null,"success")}
                </div>

                <div class="services-grid">
                    ${this.renderServicesGrid(this.services)}
                </div>

                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,r=>this.loadPendingServices(r))}
                </div>
            </div>
        `,this.attachEventListeners()},renderServicesGrid(e){return!e||e.length===0?o.emptyState("check-circle","No Pending Services","All services have been reviewed. Great job!"):e.map(t=>o.serviceCard(t)).join("")},attachEventListeners(){document.querySelectorAll("[data-action]").forEach(e=>{e.addEventListener("click",t=>{const a=t.currentTarget.dataset.action,s=t.currentTarget.dataset.id;switch(a){case"view":this.viewService(s);break;case"approve":this.approveService(s);break;case"reject":this.rejectService(s);break}})})},setupEventListeners(){},async viewService(e){try{const t=await l.getServiceById(e),a=t.service||t;this.showServiceDetailsModal(a)}catch{i.showToast("Failed to load service","error")}},showServiceDetailsModal(e){var s,n,r,c;const t=`
            <div class="service-details">
                <div class="service-details-header">
                    <img src="${((s=e.images)==null?void 0:s[0])||"/placeholder-service.jpg"}" alt="${e.title}" class="service-details-image" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
                    <h3 style="margin-top: 16px;">${e.title}</h3>
                    <p style="color: var(--color-muted-foreground);">${e.category}</p>
                </div>
                <div class="service-details-body" style="margin-top: 16px;">
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Price:</span>
                        <span class="detail-value" style="font-weight: 600;">TZS ${i.formatNumber(e.price||0)}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${e.location||"N/A"}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Provider:</span>
                        <span class="detail-value">${e.business_name||((n=e.provider)==null?void 0:n.name)||"N/A"}</span>
                    </div>
                    <div class="detail-row" style="padding: 8px 0;">
                        <span class="detail-label">Description:</span>
                        <p style="margin-top: 8px; color: var(--color-muted-foreground);">${e.description||"No description"}</p>
                    </div>
                </div>
            </div>
        `,a=document.getElementById("modalContainer")||this.createModalContainer();a.innerHTML=o.modal("serviceDetailsModal","Service Details",t,`
            <button class="btn btn-outline modal-close-btn">Close</button>
            <button class="btn btn-danger" onclick="ServiceApprovalPage.rejectService('${e.id}')">Reject</button>
            <button class="btn btn-success" onclick="ServiceApprovalPage.approveService('${e.id}')">Approve</button>
        `),(r=a.querySelector(".modal-close"))==null||r.addEventListener("click",()=>a.innerHTML=""),(c=a.querySelector(".modal-close-btn"))==null||c.addEventListener("click",()=>a.innerHTML="")},createModalContainer(){const e=document.createElement("div");return e.id="modalContainer",document.body.appendChild(e),e},async approveService(e){i.showConfirm("Approve Service","Are you sure you want to approve this service? It will become visible to travelers.",async()=>{try{await l.approveService(e),i.showToast("Service approved successfully","success"),document.getElementById("modalContainer").innerHTML="",this.loadPendingServices(this.currentPage)}catch{i.showToast("Failed to approve service","error")}})},async rejectService(e){i.showConfirm("Reject Service","Are you sure you want to reject this service?",async()=>{try{await l.rejectService(e,"Rejected by admin"),i.showToast("Service rejected","success"),document.getElementById("modalContainer").innerHTML="",this.loadPendingServices(this.currentPage)}catch{i.showToast("Failed to reject service","error")}})},destroy(){}};window.ServiceApprovalPage=f;const N={bookings:[],currentPage:1,filters:{},async init(){await this.loadBookings(),this.setupEventListeners()},async loadBookings(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading bookings...");const a={page:e,limit:d.PAGINATION.DEFAULT_LIMIT,...this.filters},s=await l.getAllBookings(a);this.bookings=s.bookings||[],this.currentPage=e,this.renderBookings(s)}catch(t){console.error("Error loading bookings:",t),i.showToast("Failed to load bookings","error")}},renderBookings(e){var a,s,n,r;const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="bookings-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Bookings Management</h1>
                        <p class="page-subtitle">Monitor and manage all bookings</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="exportBookings">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>

                <div class="stats-grid stats-grid-4">
                    ${o.statCard("Total Bookings",i.formatNumber(((a=e.stats)==null?void 0:a.total)||0),"calendar-check",null,"primary")}
                    ${o.statCard("Confirmed",i.formatNumber(((s=e.stats)==null?void 0:s.confirmed)||0),"check",null,"success")}
                    ${o.statCard("Pending",i.formatNumber(((n=e.stats)==null?void 0:n.pending)||0),"clock",null,"warning")}
                    ${o.statCard("Revenue",i.formatCurrency(((r=e.stats)==null?void 0:r.revenue)||0),"dollar-sign",null,"accent")}
                </div>

                ${o.filterBar([{type:"search",key:"search",placeholder:"Search bookings..."},{type:"select",key:"status",placeholder:"All Status",options:d.STATUS.BOOKINGS.map(c=>({value:c,label:c.charAt(0).toUpperCase()+c.slice(1)}))},{type:"date",key:"dateFrom",placeholder:"From Date"},{type:"date",key:"dateTo",placeholder:"To Date"}])}

                <div class="bookings-grid">
                    ${this.renderBookingsGrid(this.bookings)}
                </div>

                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,c=>this.loadBookings(c))}
                </div>
            </div>
        `,this.attachEventListeners()},renderBookingsGrid(e){return!e||e.length===0?o.emptyState("calendar-check","No Bookings Found","No bookings match your current filters"):e.map(t=>o.bookingCard(t)).join("")},attachEventListeners(){document.querySelectorAll("[data-action]").forEach(e=>{e.addEventListener("click",t=>{const a=t.currentTarget.dataset.action,s=t.currentTarget.dataset.id;switch(a){case"view":this.viewBooking(s);break;case"cancel":this.cancelBooking(s);break}})})},setupEventListeners(){document.addEventListener("change",e=>{e.target.dataset.filter&&(this.filters[e.target.dataset.filter]=e.target.value,this.loadBookings(1))}),document.addEventListener("input",i.debounce(e=>{e.target.dataset.filter==="search"&&(this.filters.search=e.target.value,this.loadBookings(1))},500))},async viewBooking(e){try{const t=await l.getBookingById(e);i.showToast("Booking details loaded","success")}catch{i.showToast("Failed to load booking","error")}},async cancelBooking(e){i.showConfirm("Cancel Booking","Are you sure you want to cancel this booking?",async()=>{try{await l.cancelBooking(e,"Cancelled by admin"),i.showToast("Booking cancelled","success"),this.loadBookings(this.currentPage)}catch{i.showToast("Failed to cancel booking","error")}})},destroy(){}},x={payments:[],currentPage:1,filters:{},async init(){await this.loadPayments(),this.setupEventListeners()},async loadPayments(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading payments...");const a={page:e,limit:d.PAGINATION.DEFAULT_LIMIT,...this.filters},s=await l.getAllPayments(a);this.payments=s.payments||[],this.currentPage=e,this.renderPayments(s)}catch(t){console.error("Error loading payments:",t),i.showToast("Failed to load payments","error")}},renderPayments(e){var a,s,n,r;const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="payments-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Payments Management</h1>
                        <p class="page-subtitle">Track all payment transactions</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="exportPayments">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>

                <div class="stats-grid stats-grid-4">
                    ${o.statCard("Total Payments",i.formatNumber(((a=e.stats)==null?void 0:a.total)||0),"credit-card",null,"primary")}
                    ${o.statCard("Completed",i.formatCurrency(((s=e.stats)==null?void 0:s.completed)||0),"check-circle",null,"success")}
                    ${o.statCard("Pending",i.formatCurrency(((n=e.stats)==null?void 0:n.pending)||0),"clock",null,"warning")}
                    ${o.statCard("Failed",i.formatNumber(((r=e.stats)==null?void 0:r.failed)||0),"times-circle",null,"danger")}
                </div>

                ${o.filterBar([{type:"search",key:"search",placeholder:"Search payments..."},{type:"select",key:"status",placeholder:"All Status",options:d.STATUS.PAYMENTS.map(c=>({value:c,label:c.charAt(0).toUpperCase()+c.slice(1)}))},{type:"date",key:"dateFrom",placeholder:"From Date"},{type:"date",key:"dateTo",placeholder:"To Date"}])}

                <div class="card">
                    <div class="card-body">
                        ${this.renderPaymentsTable(this.payments)}
                    </div>
                </div>

                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,c=>this.loadPayments(c))}
                </div>
            </div>
        `,this.attachEventListeners()},renderPaymentsTable(e){if(!e||e.length===0)return o.emptyState("credit-card","No Payments Found","No payments match your current filters");const t=[{key:"id",label:"Transaction ID",sortable:!0,formatter:s=>`#${s.substring(0,8)}`},{key:"user",label:"User",sortable:!1,formatter:s=>(s==null?void 0:s.name)||"-"},{key:"amount",label:"Amount",sortable:!0,formatter:s=>i.formatCurrency(s)},{key:"method",label:"Method",sortable:!1},{key:"status",label:"Status",sortable:!0,formatter:s=>i.getStatusBadge(s)},{key:"createdAt",label:"Date",sortable:!0,formatter:s=>i.formatDate(s,!0)}],a=[{name:"view",icon:"eye",label:"View",type:"info"}];return o.dataTable(t,e,a)},attachEventListeners(){document.querySelectorAll('[data-action="view"]').forEach(e=>{e.addEventListener("click",t=>{const a=t.currentTarget.dataset.id;this.viewPayment(a)})})},setupEventListeners(){document.addEventListener("change",e=>{e.target.dataset.filter&&(this.filters[e.target.dataset.filter]=e.target.value,this.loadPayments(1))}),document.addEventListener("input",i.debounce(e=>{e.target.dataset.filter==="search"&&(this.filters.search=e.target.value,this.loadPayments(1))},500))},async viewPayment(e){try{const t=await l.getPaymentById(e);i.showToast("Payment details loaded","success")}catch{i.showToast("Failed to load payment","error")}},destroy(){}},L={charts:{},async init(){await this.loadAnalytics()},async loadAnalytics(){try{const e=document.getElementById("pageContent");e.innerHTML=o.loadingSpinner("Loading analytics...");const t=await l.getDashboardAnalytics();this.renderAnalytics(t)}catch(e){console.error("Error loading analytics:",e),i.showToast("Failed to load analytics","error")}},renderAnalytics(e){const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="analytics-page">
                <div class="page-header">
                    <h1 class="page-title">Analytics & Insights</h1>
                    <p class="page-subtitle">Detailed analytics and performance metrics</p>
                </div>

                <div class="dashboard-row">
                    <div class="dashboard-col-12">
                        <div class="card">
                            ${o.chartContainer("analyticsRevenueChart","Revenue Trends","line")}
                        </div>
                    </div>
                </div>

                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            ${o.chartContainer("analyticsUsersChart","User Analytics","bar")}
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            ${o.chartContainer("analyticsBookingsChart","Booking Analytics","line")}
                        </div>
                    </div>
                </div>
            </div>
        `,this.initializeCharts(e)},initializeCharts(e){var t,a;this.charts.revenue=new Chart(document.getElementById("analyticsRevenueChart"),{type:"line",data:{labels:((t=e.revenueData)==null?void 0:t.labels)||[],datasets:[{label:"Revenue",data:((a=e.revenueData)==null?void 0:a.values)||[],borderColor:d.CHART_COLORS.primary,backgroundColor:d.CHART_COLORS.primary+"20",tension:.4,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}})},destroy(){Object.values(this.charts).forEach(e=>{e&&e.destroy()}),this.charts={}}},S={paymentSettings:{},async init(){await this.loadSettings()},async loadSettings(){try{const e=document.getElementById("pageContent");e.innerHTML=o.loadingSpinner("Loading settings...");let t={};try{const a=await l.getSettings();a.success!==!1&&(t=a)}catch{console.log("General settings not found, using defaults"),t={siteName:"iSafari",contactEmail:"support@isafari.com",supportPhone:"+255 123 456 789",commissionRate:10,currency:"TZS",emailFrom:"noreply@isafari.com"}}try{const s=await(await fetch(`${d.API_BASE_URL}/admin/settings/payment-gateway`)).json();s.success&&(this.paymentSettings=s.settings||{})}catch{console.log("Payment settings not found, using defaults"),this.paymentSettings={}}this.renderSettings(t)}catch(e){console.error("Error loading settings:",e),this.renderSettings({siteName:"iSafari",contactEmail:"support@isafari.com",supportPhone:"+255 123 456 789",commissionRate:10,currency:"TZS",emailFrom:"noreply@isafari.com"})}},renderSettings(e){const t=document.getElementById("pageContent"),a=this.paymentSettings;t.innerHTML=`
            <div class="settings-page">
                <div class="page-header">
                    <h1 class="page-title">System Settings</h1>
                    <p class="page-subtitle">Configure system-wide settings</p>
                </div>

                <div class="settings-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-cog"></i> General Settings</h3>
                        </div>
                        <div class="card-body">
                            <form id="generalSettingsForm">
                                ${o.formField({type:"text",name:"siteName",label:"Site Name",value:e.siteName||"iSafari",required:!0})}
                                ${o.formField({type:"email",name:"contactEmail",label:"Contact Email",value:e.contactEmail||"",required:!0})}
                                ${o.formField({type:"text",name:"supportPhone",label:"Support Phone",value:e.supportPhone||""})}
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-dollar-sign"></i> Payment Settings</h3>
                        </div>
                        <div class="card-body">
                            <form id="paymentSettingsForm">
                                ${o.formField({type:"number",name:"commissionRate",label:"Commission Rate (%)",value:e.commissionRate||10,required:!0})}
                                ${o.formField({type:"select",name:"currency",label:"Default Currency",value:e.currency||"TZS",options:[{value:"TZS",label:"TZS"},{value:"USD",label:"USD"}]})}
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-bell"></i> Notification Settings</h3>
                        </div>
                        <div class="card-body">
                            <form id="notificationSettingsForm">
                                ${o.formField({type:"text",name:"emailFrom",label:"Email From",value:e.emailFrom||"noreply@isafari.com"})}
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    </div>

                    <!-- Company Visa/MasterCard Payment Gateway Settings -->
                    <div class="card" style="grid-column: 1 / -1;">
                        <div class="card-header" style="background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%); color: white;">
                            <h3 class="card-title"><i class="fas fa-credit-card"></i> Company Payment Gateway (Visa/MasterCard)</h3>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info" style="margin-bottom: 20px;">
                                <i class="fas fa-info-circle"></i>
                                <strong>Important:</strong> These are the company's payment gateway credentials. All promotion payments from service providers will be processed through this account.
                            </div>
                            <form id="companyPaymentForm">
                                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-key"></i> API Public Key (Publishable Key)</label>
                                        <input type="text" name="publicKey" class="form-control" value="${a.publicKey||""}" placeholder="pk_live_xxxxxxxxxxxx" required>
                                        <small class="form-text">Your Stripe/Payment Gateway publishable key</small>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-lock"></i> API Secret Key</label>
                                        <input type="password" name="secretKey" class="form-control" value="${a.secretKey||""}" placeholder="sk_live_xxxxxxxxxxxx" required>
                                        <small class="form-text">Your Stripe/Payment Gateway secret key (kept secure)</small>
                                    </div>
                                </div>
                                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-building"></i> Merchant ID</label>
                                        <input type="text" name="merchantId" class="form-control" value="${a.merchantId||""}" placeholder="merchant_xxxx">
                                        <small class="form-text">Your merchant account ID</small>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-globe"></i> Payment Gateway</label>
                                        <select name="gateway" class="form-control">
                                            <option value="stripe" ${a.gateway==="stripe"?"selected":""}>Stripe</option>
                                            <option value="paystack" ${a.gateway==="paystack"?"selected":""}>Paystack</option>
                                            <option value="flutterwave" ${a.gateway==="flutterwave"?"selected":""}>Flutterwave</option>
                                            <option value="pesapal" ${a.gateway==="pesapal"?"selected":""}>PesaPal</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-university"></i> Company Bank Account Name</label>
                                        <input type="text" name="bankAccountName" class="form-control" value="${a.bankAccountName||""}" placeholder="iSafari Global Ltd">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-hashtag"></i> Company Bank Account Number</label>
                                        <input type="text" name="bankAccountNumber" class="form-control" value="${a.bankAccountNumber||""}" placeholder="xxxx-xxxx-xxxx">
                                    </div>
                                </div>
                                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-toggle-on"></i> Environment</label>
                                        <select name="environment" class="form-control">
                                            <option value="sandbox" ${a.environment==="sandbox"?"selected":""}>Sandbox (Testing)</option>
                                            <option value="production" ${a.environment==="production"?"selected":""}>Production (Live)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-check-circle"></i> Status</label>
                                        <select name="isActive" class="form-control">
                                            <option value="true" ${a.isActive===!0||a.isActive==="true"?"selected":""}>Active</option>
                                            <option value="false" ${a.isActive===!1||a.isActive==="false"?"selected":""}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div style="margin-top: 20px; display: flex; gap: 10px;">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i> Save Payment Gateway Settings
                                    </button>
                                    <button type="button" class="btn btn-secondary" onclick="SettingsPage.testPaymentGateway()">
                                        <i class="fas fa-vial"></i> Test Connection
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `,this.setupEventListeners()},setupEventListeners(){var e,t,a,s;(e=document.getElementById("generalSettingsForm"))==null||e.addEventListener("submit",n=>{n.preventDefault(),this.saveSettings("general")}),(t=document.getElementById("paymentSettingsForm"))==null||t.addEventListener("submit",n=>{n.preventDefault(),this.saveSettings("payment")}),(a=document.getElementById("notificationSettingsForm"))==null||a.addEventListener("submit",n=>{n.preventDefault(),this.saveSettings("notification")}),(s=document.getElementById("companyPaymentForm"))==null||s.addEventListener("submit",n=>{n.preventDefault(),this.saveCompanyPaymentSettings()})},async saveSettings(e){try{i.showToast("Settings saved successfully","success")}catch{i.showToast("Failed to save settings","error")}},async saveCompanyPaymentSettings(){try{const e=document.getElementById("companyPaymentForm"),t=new FormData(e),a={publicKey:t.get("publicKey"),secretKey:t.get("secretKey"),merchantId:t.get("merchantId"),gateway:t.get("gateway"),bankAccountName:t.get("bankAccountName"),bankAccountNumber:t.get("bankAccountNumber"),environment:t.get("environment"),isActive:t.get("isActive")==="true"},n=await(await fetch(`${d.API_BASE_URL}/admin/settings/payment-gateway`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)})).json();n.success?(i.showToast("Payment gateway settings saved successfully!","success"),this.paymentSettings=a):i.showToast(n.message||"Failed to save settings","error")}catch(e){console.error("Error saving payment settings:",e),i.showToast("Failed to save payment gateway settings","error")}},async testPaymentGateway(){try{i.showToast("Testing payment gateway connection...","info");const t=await(await fetch(`${d.API_BASE_URL}/admin/settings/payment-gateway/test`)).json();t.success?i.showToast("Payment gateway connection successful!","success"):i.showToast(t.message||"Connection test failed","error")}catch{i.showToast("Failed to test payment gateway","error")}},destroy(){}};window.SettingsPage=S;const k={categories:[],async init(){await this.loadCategories()},async loadCategories(){try{const e=document.getElementById("pageContent");e.innerHTML=o.loadingSpinner("Loading categories...");const t=await l.getCategories();this.categories=t.categories||[],this.renderCategories()}catch(e){console.error("Error loading categories:",e);const t=document.getElementById("pageContent");t.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Categories</h2>
                    <p>${e.message}</p>
                    <button class="btn btn-primary" onclick="CategoriesPage.loadCategories()">Try Again</button>
                </div>
            `}},renderCategories(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="categories-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Service Categories</h1>
                        <p class="page-subtitle">Manage service categories</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        <div class="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
                            ${this.categories.length>0?this.categories.map(t=>`
                                <div class="category-card" style="padding: 20px; background: var(--color-card); border-radius: 8px; border: 1px solid var(--color-border);">
                                    <h3 style="margin: 0 0 8px 0;">${t.name||t.id}</h3>
                                    <p style="color: var(--color-muted-foreground); margin: 0;">${t.count||0} services</p>
                                </div>
                            `).join(""):"<p>No categories found</p>"}
                        </div>
                    </div>
                </div>
            </div>
        `},destroy(){}},D={destinations:[],async init(){await this.loadDestinations()},async loadDestinations(){try{const e=document.getElementById("pageContent");e.innerHTML=o.loadingSpinner("Loading destinations...");const t=await l.getDestinations();this.destinations=t.destinations||[],this.renderDestinations()}catch(e){console.error("Error loading destinations:",e);const t=document.getElementById("pageContent");t.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Destinations</h2>
                    <p>${e.message}</p>
                    <button class="btn btn-primary" onclick="DestinationsPage.loadDestinations()">Try Again</button>
                </div>
            `}},renderDestinations(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="destinations-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Destinations</h1>
                        <p class="page-subtitle">Manage service destinations</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        <div class="destinations-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
                            ${this.destinations.length>0?this.destinations.map(t=>`
                                <div class="destination-card" style="padding: 20px; background: var(--color-card); border-radius: 8px; border: 1px solid var(--color-border);">
                                    <h3 style="margin: 0 0 8px 0;">${t.name||t.id}</h3>
                                    <p style="color: var(--color-muted-foreground); margin: 0;">${t.region||""}</p>
                                    <p style="color: var(--color-muted-foreground); margin: 4px 0 0 0;">${t.count||0} services</p>
                                </div>
                            `).join(""):"<p>No destinations found</p>"}
                        </div>
                    </div>
                </div>
            </div>
        `},destroy(){}},R={preOrders:[],currentPage:1,async init(){await this.loadPreOrders()},async loadPreOrders(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading pre-orders...");const a=await l.getPreOrders({page:e,limit:d.PAGINATION.DEFAULT_LIMIT});this.preOrders=a.preOrders||[],this.currentPage=e,this.renderPreOrders(a)}catch(t){console.error("Error loading pre-orders:",t);const a=document.getElementById("pageContent");a.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Pre-Orders</h2>
                    <p>${t.message}</p>
                    <button class="btn btn-primary" onclick="PreOrdersPage.loadPreOrders()">Try Again</button>
                </div>
            `}},renderPreOrders(e){const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="pre-orders-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Pre-Orders</h1>
                        <p class="page-subtitle">Manage pending pre-orders</p>
                    </div>
                </div>
                <div class="stats-grid stats-grid-2">
                    ${o.statCard("Total Pre-Orders",i.formatNumber(e.total||0),"shopping-cart",null,"primary")}
                    ${o.statCard("Pending",i.formatNumber(this.preOrders.length),"clock",null,"warning")}
                </div>
                <div class="card">
                    <div class="card-body">
                        ${this.renderPreOrdersTable()}
                    </div>
                </div>
                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,a=>this.loadPreOrders(a))}
                </div>
            </div>
        `},renderPreOrdersTable(){return!this.preOrders||this.preOrders.length===0?o.emptyState("shopping-cart","No Pre-Orders","No pre-orders found"):`
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Service</th>
                        <th>Traveler</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.preOrders.map(e=>{var t,a;return`
                        <tr>
                            <td>#${e.id}</td>
                            <td>${((t=e.service)==null?void 0:t.title)||"N/A"}</td>
                            <td>${((a=e.traveler)==null?void 0:a.name)||"N/A"}</td>
                            <td>${i.formatCurrency(e.totalAmount||0)}</td>
                            <td>${i.formatDate(e.bookingDate)}</td>
                            <td>${i.getStatusBadge(e.status)}</td>
                        </tr>
                    `}).join("")}
                </tbody>
            </table>
        `},destroy(){}},O={events:[],currentMonth:new Date().getMonth()+1,currentYear:new Date().getFullYear(),async init(){await this.loadCalendar()},async loadCalendar(){try{const e=document.getElementById("pageContent");e.innerHTML=o.loadingSpinner("Loading calendar...");const t=await l.getBookingCalendar({month:this.currentMonth,year:this.currentYear});this.events=t.events||[],this.renderCalendar(t)}catch(e){console.error("Error loading calendar:",e);const t=document.getElementById("pageContent");t.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Calendar</h2>
                    <p>${e.message}</p>
                    <button class="btn btn-primary" onclick="BookingCalendarPage.loadCalendar()">Try Again</button>
                </div>
            `}},renderCalendar(e){const t=["January","February","March","April","May","June","July","August","September","October","November","December"],a=document.getElementById("pageContent");a.innerHTML=`
            <div class="calendar-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Booking Calendar</h1>
                        <p class="page-subtitle">View bookings by date</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="prevMonth"><i class="fas fa-chevron-left"></i></button>
                        <span style="padding: 0 16px; font-weight: 600;">${t[this.currentMonth-1]} ${this.currentYear}</span>
                        <button class="btn btn-outline" id="nextMonth"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        ${this.renderCalendarGrid()}
                    </div>
                </div>
                <div class="card" style="margin-top: 20px;">
                    <div class="card-header">
                        <h3 class="card-title">Bookings This Month</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderEventsList()}
                    </div>
                </div>
            </div>
        `,this.attachEventListeners()},renderCalendarGrid(){const e=new Date(this.currentYear,this.currentMonth,0).getDate(),t=new Date(this.currentYear,this.currentMonth-1,1).getDay(),a=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];let s='<div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">';a.forEach(n=>{s+=`<div style="text-align: center; font-weight: 600; padding: 8px; background: var(--color-muted); border-radius: 4px;">${n}</div>`});for(let n=0;n<t;n++)s+="<div></div>";for(let n=1;n<=e;n++){const r=`${this.currentYear}-${String(this.currentMonth).padStart(2,"0")}-${String(n).padStart(2,"0")}`,c=this.events.filter(v=>v.date&&v.date.startsWith(r)),p=c.length>0;s+=`
                <div style="text-align: center; padding: 8px; border: 1px solid var(--color-border); border-radius: 4px; ${p?"background: var(--color-primary); color: white;":""}">
                    ${n}
                    ${p?`<div style="font-size: 10px;">${c.length} booking${c.length>1?"s":""}</div>`:""}
                </div>
            `}return s+="</div>",s},renderEventsList(){return!this.events||this.events.length===0?'<p style="color: var(--color-muted-foreground);">No bookings this month</p>':`
            <div class="events-list">
                ${this.events.map(e=>`
                    <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--color-border);">
                        <div>
                            <strong>${e.title}</strong>
                            <div style="color: var(--color-muted-foreground); font-size: 14px;">${e.traveler}</div>
                        </div>
                        <div style="text-align: right;">
                            <div>${i.formatDate(e.date)}</div>
                            <div>${i.getStatusBadge(e.status)}</div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `},attachEventListeners(){var e,t;(e=document.getElementById("prevMonth"))==null||e.addEventListener("click",()=>{this.currentMonth--,this.currentMonth<1&&(this.currentMonth=12,this.currentYear--),this.loadCalendar()}),(t=document.getElementById("nextMonth"))==null||t.addEventListener("click",()=>{this.currentMonth++,this.currentMonth>12&&(this.currentMonth=1,this.currentYear++),this.loadCalendar()})},destroy(){}},B={transactions:[],currentPage:1,async init(){await this.loadTransactions()},async loadTransactions(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading transactions...");const a=await l.getTransactions({page:e,limit:d.PAGINATION.DEFAULT_LIMIT});this.transactions=a.transactions||[],this.currentPage=e,this.renderTransactions(a)}catch(t){console.error("Error loading transactions:",t);const a=document.getElementById("pageContent");a.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Transactions</h2>
                    <p>${t.message}</p>
                    <button class="btn btn-primary" onclick="TransactionsPage.loadTransactions()">Try Again</button>
                </div>
            `}},renderTransactions(e){const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="transactions-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Transactions</h1>
                        <p class="page-subtitle">View all payment transactions</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="exportTransactions">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        ${this.renderTransactionsTable()}
                    </div>
                </div>
                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,a=>this.loadTransactions(a))}
                </div>
            </div>
        `},renderTransactionsTable(){return!this.transactions||this.transactions.length===0?o.emptyState("exchange-alt","No Transactions","No transactions found"):`
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Reference</th>
                        <th>User</th>
                        <th>Service</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.transactions.map(e=>{var t;return`
                        <tr>
                            <td>${e.reference||e.id}</td>
                            <td>${((t=e.user)==null?void 0:t.name)||"N/A"}</td>
                            <td>${e.service||"N/A"}</td>
                            <td>${i.formatCurrency(e.amount||0)}</td>
                            <td>${e.type||"N/A"}</td>
                            <td>${i.getStatusBadge(e.status)}</td>
                            <td>${i.formatDate(e.createdAt)}</td>
                        </tr>
                    `}).join("")}
                </tbody>
            </table>
        `},destroy(){}},M={revenueData:null,period:"month",async init(){await this.loadRevenue()},async loadRevenue(){try{const e=document.getElementById("pageContent");e.innerHTML=o.loadingSpinner("Loading revenue data...");const t=await l.getRevenue({period:this.period});this.revenueData=t.revenue||{},this.renderRevenue()}catch(e){console.error("Error loading revenue:",e);const t=document.getElementById("pageContent");t.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Revenue</h2>
                    <p>${e.message}</p>
                    <button class="btn btn-primary" onclick="RevenuePage.loadRevenue()">Try Again</button>
                </div>
            `}},renderRevenue(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="revenue-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Revenue</h1>
                        <p class="page-subtitle">Track revenue and earnings</p>
                    </div>
                    <div class="page-actions">
                        <select id="periodSelect" class="form-select" style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--color-border);">
                            <option value="today" ${this.period==="today"?"selected":""}>Today</option>
                            <option value="week" ${this.period==="week"?"selected":""}>This Week</option>
                            <option value="month" ${this.period==="month"?"selected":""}>This Month</option>
                            <option value="year" ${this.period==="year"?"selected":""}>This Year</option>
                        </select>
                    </div>
                </div>
                <div class="stats-grid stats-grid-3">
                    ${o.statCard("Total Revenue",i.formatCurrency(this.revenueData.total||0),"dollar-sign",null,"success")}
                    ${o.statCard("Period",this.period.charAt(0).toUpperCase()+this.period.slice(1),"calendar",null,"primary")}
                    ${o.statCard("Categories",(this.revenueData.byCategory||[]).length,"tags",null,"accent")}
                </div>
                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Revenue by Category</h3>
                            </div>
                            <div class="card-body">
                                ${this.renderCategoryRevenue()}
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Daily Revenue</h3>
                            </div>
                            <div class="card-body">
                                ${this.renderDailyRevenue()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,this.attachEventListeners()},renderCategoryRevenue(){const e=this.revenueData.byCategory||[];return e.length===0?'<p style="color: var(--color-muted-foreground);">No category data available</p>':`
            <div class="category-revenue">
                ${e.map(t=>`
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--color-border);">
                        <span>${t.category}</span>
                        <strong>${i.formatCurrency(t.revenue)}</strong>
                    </div>
                `).join("")}
            </div>
        `},renderDailyRevenue(){const e=this.revenueData.daily||[];return e.length===0?'<p style="color: var(--color-muted-foreground);">No daily data available</p>':`
            <div class="daily-revenue">
                ${e.slice(-10).map(t=>`
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--color-border);">
                        <span>${i.formatDate(t.date)}</span>
                        <strong>${i.formatCurrency(t.revenue)}</strong>
                    </div>
                `).join("")}
            </div>
        `},attachEventListeners(){var e;(e=document.getElementById("periodSelect"))==null||e.addEventListener("change",t=>{this.period=t.target.value,this.loadRevenue()})},destroy(){}},U={payouts:[],currentPage:1,async init(){await this.loadPayouts()},async loadPayouts(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading payouts...");const a=await l.getPayouts({page:e,limit:d.PAGINATION.DEFAULT_LIMIT});this.payouts=a.payouts||[],this.currentPage=e,this.renderPayouts(a)}catch(t){console.error("Error loading payouts:",t);const a=document.getElementById("pageContent");a.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Payouts</h2>
                    <p>${t.message}</p>
                    <button class="btn btn-primary" onclick="PayoutsPage.loadPayouts()">Try Again</button>
                </div>
            `}},renderPayouts(e){const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="payouts-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Payouts</h1>
                        <p class="page-subtitle">Manage provider payouts</p>
                    </div>
                </div>
                <div class="stats-grid stats-grid-2">
                    ${o.statCard("Total Providers",i.formatNumber(e.total||0),"users",null,"primary")}
                    ${o.statCard("Pending Payouts",i.formatNumber(this.payouts.filter(a=>a.status==="pending").length),"clock",null,"warning")}
                </div>
                <div class="card">
                    <div class="card-body">
                        ${this.renderPayoutsTable()}
                    </div>
                </div>
                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,a=>this.loadPayouts(a))}
                </div>
            </div>
        `},renderPayoutsTable(){return!this.payouts||this.payouts.length===0?o.emptyState("money-bill-wave","No Payouts","No payout data found"):`
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Provider</th>
                        <th>Email</th>
                        <th>Total Earnings</th>
                        <th>Bookings</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.payouts.map(e=>{var t,a;return`
                        <tr>
                            <td>${((t=e.provider)==null?void 0:t.name)||"N/A"}</td>
                            <td>${((a=e.provider)==null?void 0:a.email)||"N/A"}</td>
                            <td>${i.formatCurrency(e.totalEarnings||0)}</td>
                            <td>${e.totalBookings||0}</td>
                            <td>${i.getStatusBadge(e.status||"pending")}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" data-action="process" data-id="${e.id}">
                                    Process
                                </button>
                            </td>
                        </tr>
                    `}).join("")}
                </tbody>
            </table>
        `},destroy(){}},_={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">User Verification</h1>
                    <p class="page-subtitle">Verify user accounts</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${o.emptyState("user-check","No Pending Verifications","All users have been verified")}
                </div>
            </div>
        `},destroy(){}},F={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">Content Management</h1>
                    <p class="page-subtitle">Manage website content</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${o.emptyState("file-alt","Content Management","Content management features coming soon")}
                </div>
            </div>
        `},destroy(){}},T={promotions:[],stats:{total:0,pending:0,approved:0,rejected:0},currentFilter:"all",async init(){await this.loadPromotions()},async loadPromotions(){try{const e=document.getElementById("pageContent");e.innerHTML=o.loadingSpinner("Loading promotions...");const a=await(await fetch(`${d.API_BASE_URL}/admin/promotions`)).json();a.success&&(this.promotions=a.promotions||[],this.stats=a.stats||{total:0,pending:0,approved:0,rejected:0}),this.renderPromotions()}catch(e){console.error("Error loading promotions:",e),i.showToast("Failed to load promotions","error"),this.renderPromotions()}},renderPromotions(){const e=document.getElementById("pageContent"),t=this.currentFilter==="all"?this.promotions:this.promotions.filter(a=>a.status===this.currentFilter);e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title"><i class="fas fa-bullhorn"></i> Promotion Requests</h1>
                    <p class="page-subtitle">Manage service promotion requests from providers</p>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px;">
                    <div class="stat-icon"><i class="fas fa-list"></i></div>
                    <div class="stat-value">${this.stats.total}</div>
                    <div class="stat-label">Total Requests</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); color: white; padding: 20px; border-radius: 12px;">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-value">${this.stats.pending}</div>
                    <div class="stat-label">Pending Review</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 12px;">
                    <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-value">${this.stats.approved}</div>
                    <div class="stat-label">Approved</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); color: white; padding: 20px; border-radius: 12px;">
                    <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                    <div class="stat-value">${this.stats.rejected}</div>
                    <div class="stat-label">Rejected</div>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="filter-tabs" style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn ${this.currentFilter==="all"?"btn-primary":"btn-secondary"}" onclick="PromotionsPage.filterPromotions('all')">
                    All (${this.stats.total})
                </button>
                <button class="btn ${this.currentFilter==="pending"?"btn-primary":"btn-secondary"}" onclick="PromotionsPage.filterPromotions('pending')">
                    <i class="fas fa-clock"></i> Pending (${this.stats.pending})
                </button>
                <button class="btn ${this.currentFilter==="approved"?"btn-primary":"btn-secondary"}" onclick="PromotionsPage.filterPromotions('approved')">
                    <i class="fas fa-check"></i> Approved (${this.stats.approved})
                </button>
                <button class="btn ${this.currentFilter==="rejected"?"btn-primary":"btn-secondary"}" onclick="PromotionsPage.filterPromotions('rejected')">
                    <i class="fas fa-times"></i> Rejected (${this.stats.rejected})
                </button>
            </div>

            <!-- Promotions List -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Promotion Requests</h3>
                </div>
                <div class="card-body">
                    ${t.length===0?`
                        <div class="empty-state" style="text-align: center; padding: 40px;">
                            <i class="fas fa-bullhorn" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                            <h3>No Promotion Requests</h3>
                            <p>No promotion requests found for the selected filter.</p>
                        </div>
                    `:`
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Provider</th>
                                        <th>Promotion Type</th>
                                        <th>Location</th>
                                        <th>Amount</th>
                                        <th>Payment Status</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${t.map(a=>`
                                        <tr>
                                            <td>
                                                <strong>${a.service_title||"N/A"}</strong>
                                                <br><small class="text-muted">${a.service_category||""}</small>
                                            </td>
                                            <td>
                                                ${a.provider_name||"N/A"}
                                                <br><small class="text-muted">${a.provider_email||""}</small>
                                            </td>
                                            <td>
                                                <span class="badge ${this.getPromotionTypeBadge(a.promotion_type)}">
                                                    ${this.formatPromotionType(a.promotion_type)}
                                                </span>
                                            </td>
                                            <td>${this.formatLocation(a.promotion_location)}</td>
                                            <td>
                                                <strong>TZS ${(a.cost||0).toLocaleString()}</strong>
                                            </td>
                                            <td>
                                                <span class="badge ${a.payment_status==="completed"?"badge-success":"badge-warning"}">
                                                    ${a.payment_status||"pending"}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge ${this.getStatusBadge(a.status)}">
                                                    ${a.status||"pending"}
                                                </span>
                                            </td>
                                            <td>${i.formatDate(a.created_at)}</td>
                                            <td>
                                                ${a.status==="pending"?`
                                                    <div class="btn-group">
                                                        <button class="btn btn-sm btn-success" onclick="PromotionsPage.approvePromotion(${a.id})" title="Approve">
                                                            <i class="fas fa-check"></i>
                                                        </button>
                                                        <button class="btn btn-sm btn-danger" onclick="PromotionsPage.rejectPromotion(${a.id})" title="Reject">
                                                            <i class="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                `:`
                                                    <button class="btn btn-sm btn-secondary" onclick="PromotionsPage.viewDetails(${a.id})" title="View Details">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                `}
                                            </td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>
        `},getPromotionTypeBadge(e){return{featured:"badge-purple",trending:"badge-orange",search_boost:"badge-blue"}[e]||"badge-secondary"},formatPromotionType(e){return{featured:"Featured Carousel",trending:"Trending Services",search_boost:"Search Boost"}[e]||e},formatLocation(e){return{top_carousel:"Top Carousel",max_visibility:"Max Visibility",premium_badge:"Premium Badge",homepage_slides:"Homepage Slides",trending_section:"Trending Section",increased_visibility:"Increased Visibility",search_priority:"Search Priority",top_search:"Top Search",category_priority:"Category Priority",enhanced_listing:"Enhanced Listing"}[e]||e||"N/A"},getStatusBadge(e){return{pending:"badge-warning",approved:"badge-success",rejected:"badge-danger",expired:"badge-secondary"}[e]||"badge-secondary"},filterPromotions(e){this.currentFilter=e,this.renderPromotions()},async approvePromotion(e){if(confirm("Are you sure you want to approve this promotion? The service will be promoted automatically based on the selected type."))try{i.showToast("Processing approval...","info");const a=await(await fetch(`${d.API_BASE_URL}/admin/promotions/${e}/approve`,{method:"POST",headers:{"Content-Type":"application/json"}})).json();a.success?(i.showToast("Promotion approved successfully! Service is now promoted.","success"),await this.loadPromotions()):i.showToast(a.message||"Failed to approve promotion","error")}catch(t){console.error("Error approving promotion:",t),i.showToast("Failed to approve promotion","error")}},async rejectPromotion(e){const t=prompt("Please provide a reason for rejection (optional):");if(t!==null)try{i.showToast("Processing rejection...","info");const s=await(await fetch(`${d.API_BASE_URL}/admin/promotions/${e}/reject`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reason:t})})).json();s.success?(i.showToast("Promotion rejected","success"),await this.loadPromotions()):i.showToast(s.message||"Failed to reject promotion","error")}catch(a){console.error("Error rejecting promotion:",a),i.showToast("Failed to reject promotion","error")}},viewDetails(e){const t=this.promotions.find(a=>a.id===e);t&&alert(`
Promotion Details:
------------------
Service: ${t.service_title}
Provider: ${t.provider_name}
Type: ${this.formatPromotionType(t.promotion_type)}
Location: ${this.formatLocation(t.promotion_location)}
Amount: TZS ${(t.cost||0).toLocaleString()}
Duration: ${t.duration_days} days
Payment Method: ${t.payment_method}
Payment Reference: ${t.payment_reference||"N/A"}
Status: ${t.status}
Created: ${i.formatDate(t.created_at)}
Expires: ${t.expires_at?i.formatDate(t.expires_at):"N/A"}
        `)},destroy(){}};window.PromotionsPage=T;const H={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">Reviews</h1>
                    <p class="page-subtitle">Manage user reviews</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${o.emptyState("star","Reviews","No reviews to display")}
                </div>
            </div>
        `},destroy(){}},j={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">Notifications</h1>
                    <p class="page-subtitle">Manage system notifications</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${o.emptyState("bell","Notifications","No notifications to display")}
                </div>
            </div>
        `},destroy(){}},V={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">Support Tickets</h1>
                    <p class="page-subtitle">Manage customer support</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${o.emptyState("headset","Support Tickets","No open support tickets")}
                </div>
            </div>
        `},destroy(){}},G={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">Feedback</h1>
                    <p class="page-subtitle">View user feedback</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${o.emptyState("comments","Feedback","No feedback to display")}
                </div>
            </div>
        `},destroy(){}},Y={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">Activity Logs</h1>
                    <p class="page-subtitle">View system activity</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${o.emptyState("history","Activity Logs","No activity logs to display")}
                </div>
            </div>
        `},destroy(){}},q={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">Reports</h1>
                    <p class="page-subtitle">View reported content</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${o.emptyState("flag","Reports","No reports to display")}
                </div>
            </div>
        `},destroy(){}},K={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">Admin Users</h1>
                    <p class="page-subtitle">Manage admin accounts</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${o.emptyState("user-shield","Admin Users","Admin management coming soon")}
                </div>
            </div>
        `},destroy(){}},z={async init(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div>
                    <h1 class="page-title">System Health</h1>
                    <p class="page-subtitle">Monitor system status</p>
                </div>
            </div>
            <div class="stats-grid stats-grid-4">
                ${o.statCard("API Status","Online","server",null,"success")}
                ${o.statCard("Database","Connected","database",null,"success")}
                ${o.statCard("Uptime","99.9%","clock",null,"primary")}
                ${o.statCard("Response Time","45ms","tachometer-alt",null,"accent")}
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">System Status</h3>
                </div>
                <div class="card-body">
                    <p style="color: var(--color-success);"><i class="fas fa-check-circle"></i> All systems operational</p>
                </div>
            </div>
        `},destroy(){}},W={partners:[],async init(){this.render(),await this.loadPartners(),this.setupEventListeners()},render(){const e=document.getElementById("pageContent");e.innerHTML=`
            <div class="page-header">
                <div class="page-header-content">
                    <h1 class="page-title">
                        <i class="fas fa-handshake"></i>
                        Trusted Partners
                    </h1>
                    <p class="page-description">Manage trusted partners displayed on the homepage</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" id="addPartnerBtn">
                        <i class="fas fa-plus"></i>
                        Add Partner
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <div id="partnersGrid" class="partners-grid">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                            Loading partners...
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Partner Modal -->
            <div class="modal" id="partnerModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalTitle">Add Trusted Partner</h3>
                        <button class="modal-close" id="closeModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="partnerForm">
                            <input type="hidden" id="partnerId">
                            <div class="form-group">
                                <label for="partnerName">Partner Name *</label>
                                <input type="text" id="partnerName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="partnerType">Partner Type *</label>
                                <select id="partnerType" class="form-control" required>
                                    <option value="">Select Type</option>
                                    <option value="Luxury Hotels">Luxury Hotels</option>
                                    <option value="Premium Airlines">Premium Airlines</option>
                                    <option value="Cultural Institutions">Cultural Institutions</option>
                                    <option value="Cultural Partners">Cultural Partners</option>
                                    <option value="Tour Operators">Tour Operators</option>
                                    <option value="Travel Agencies">Travel Agencies</option>
                                    <option value="Transportation">Transportation</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="partnerLogo">Logo URL</label>
                                <input type="url" id="partnerLogo" class="form-control" placeholder="https://...">
                            </div>
                            <div class="form-group">
                                <label for="partnerWebsite">Website</label>
                                <input type="url" id="partnerWebsite" class="form-control" placeholder="https://...">
                            </div>
                            <div class="form-group">
                                <label for="partnerDescription">Description</label>
                                <textarea id="partnerDescription" class="form-control" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
                        <button class="btn btn-primary" id="savePartnerBtn">Save Partner</button>
                    </div>
                </div>
            </div>
        `},async loadPartners(){try{const e=await l.get("/admin/trusted-partners");this.partners=e.partners||[],this.renderPartners()}catch(e){console.error("Error loading partners:",e),this.partners=[],this.renderPartners()}},renderPartners(){var t;const e=document.getElementById("partnersGrid");if(this.partners.length===0){e.innerHTML=`
                <div class="empty-state">
                    <i class="fas fa-handshake"></i>
                    <h3>No Trusted Partners Yet</h3>
                    <p>Add your first trusted partner to display on the homepage</p>
                    <button class="btn btn-primary" id="emptyAddBtn">
                        <i class="fas fa-plus"></i>
                        Add Partner
                    </button>
                </div>
            `,(t=document.getElementById("emptyAddBtn"))==null||t.addEventListener("click",()=>this.openModal());return}e.innerHTML=this.partners.map(a=>`
            <div class="partner-card" data-id="${a.id}">
                <div class="partner-logo">
                    ${a.logo?`<img src="${a.logo}" alt="${a.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2264%22 height=%2264%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3E${a.name.charAt(0)}%3C/text%3E%3C/svg%3E'">`:`<div class="partner-placeholder">${a.name.charAt(0)}</div>`}
                </div>
                <div class="partner-info">
                    <h4>${a.name}</h4>
                    <span class="partner-type">${a.type||"Partner"}</span>
                    ${a.description?`<p class="partner-desc">${a.description}</p>`:""}
                </div>
                <div class="partner-actions">
                    <button class="btn btn-sm btn-outline edit-btn" data-id="${a.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${a.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join(""),e.querySelectorAll(".edit-btn").forEach(a=>{a.addEventListener("click",s=>{const n=s.currentTarget.dataset.id;this.editPartner(n)})}),e.querySelectorAll(".delete-btn").forEach(a=>{a.addEventListener("click",s=>{const n=s.currentTarget.dataset.id;this.deletePartner(n)})})},setupEventListeners(){var e,t,a,s;(e=document.getElementById("addPartnerBtn"))==null||e.addEventListener("click",()=>this.openModal()),(t=document.getElementById("closeModal"))==null||t.addEventListener("click",()=>this.closeModal()),(a=document.getElementById("cancelBtn"))==null||a.addEventListener("click",()=>this.closeModal()),(s=document.getElementById("savePartnerBtn"))==null||s.addEventListener("click",()=>this.savePartner())},openModal(e=null){const t=document.getElementById("partnerModal"),a=document.getElementById("modalTitle");e?(a.textContent="Edit Trusted Partner",document.getElementById("partnerId").value=e.id,document.getElementById("partnerName").value=e.name||"",document.getElementById("partnerType").value=e.type||"",document.getElementById("partnerLogo").value=e.logo||"",document.getElementById("partnerWebsite").value=e.website||"",document.getElementById("partnerDescription").value=e.description||""):(a.textContent="Add Trusted Partner",document.getElementById("partnerForm").reset(),document.getElementById("partnerId").value=""),t.classList.add("active")},closeModal(){document.getElementById("partnerModal").classList.remove("active")},async savePartner(){const e=document.getElementById("partnerId").value,t={name:document.getElementById("partnerName").value,type:document.getElementById("partnerType").value,logo:document.getElementById("partnerLogo").value,website:document.getElementById("partnerWebsite").value,description:document.getElementById("partnerDescription").value,is_active:!0};if(!t.name||!t.type){i.showToast("Please fill in required fields","error");return}try{e?(await l.put(`/admin/trusted-partners/${e}`,t),i.showToast("Partner updated successfully","success")):(await l.post("/admin/trusted-partners",t),i.showToast("Partner added successfully","success")),this.closeModal(),await this.loadPartners()}catch(a){console.error("Error saving partner:",a),i.showToast("Error saving partner","error")}},editPartner(e){const t=this.partners.find(a=>a.id==e);t&&this.openModal(t)},async deletePartner(e){i.showConfirm("Delete Partner","Are you sure you want to delete this partner?",async()=>{try{await l.delete(`/admin/trusted-partners/${e}`),i.showToast("Partner deleted successfully","success"),await this.loadPartners()}catch(t){console.error("Error deleting partner:",t),i.showToast("Error deleting partner","error")}})},destroy(){}},E={providers:[],currentPage:1,filters:{},async init(){await this.loadProviders(),this.setupEventListeners()},async loadProviders(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading providers...");const a={page:e,limit:d.PAGINATION.DEFAULT_LIMIT,...this.filters},s=await l.get("/admin/providers/verification",a);this.providers=s.providers||[],this.currentPage=e,this.renderProviders(s)}catch(t){console.error("Error loading providers:",t);const a=document.getElementById("pageContent");a.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Providers</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${t.message||"Unable to connect to the server"}</p>
                    <button class="btn btn-primary" onclick="ProviderVerificationPage.loadProviders()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `,i.showToast("Failed to load providers","error")}},renderProviders(e){var a,s,n;const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="provider-verification-page">
                <!-- Page Header -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Provider Verification</h1>
                        <p class="page-subtitle">Manage verification badges for service providers</p>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-grid stats-grid-3">
                    ${o.statCard("Total Providers",i.formatNumber(((a=e.stats)==null?void 0:a.total)||0),"briefcase",null,"primary")}
                    ${o.statCard("Verified",i.formatNumber(((s=e.stats)==null?void 0:s.verified)||0),"check-circle",null,"success")}
                    ${o.statCard("Unverified",i.formatNumber(((n=e.stats)==null?void 0:n.unverified)||0),"clock",null,"warning")}
                </div>

                <!-- Filters -->
                ${o.filterBar([{type:"search",key:"search",placeholder:"Search providers..."},{type:"select",key:"status",placeholder:"All Status",options:[{value:"verified",label:"Verified"},{value:"unverified",label:"Unverified"}]}])}

                <!-- Providers Table -->
                <div class="card">
                    <div class="card-body">
                        ${this.renderProvidersTable(this.providers)}
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,r=>this.loadProviders(r))}
                </div>
            </div>
        `,this.attachTableEventListeners()},renderProvidersTable(e){if(!e||e.length===0)return o.emptyState("briefcase","No Providers Found","No service providers match your current filters");const t=[{key:"businessName",label:"Provider",sortable:!0,formatter:(s,n)=>{var r,c;return`
                <div class="user-cell">
                    <img src="${i.getAvatarUrl(n.businessName,(r=n.user)==null?void 0:r.avatar)}" alt="${n.businessName}" class="user-cell-avatar">
                    <div class="user-cell-info">
                        <div class="user-cell-name">${n.businessName||"Unknown Business"}</div>
                        <div class="user-cell-email">${((c=n.user)==null?void 0:c.email)||""}</div>
                    </div>
                </div>
            `}},{key:"businessType",label:"Type",sortable:!0},{key:"location",label:"Location",sortable:!0},{key:"rating",label:"Rating",sortable:!0,formatter:s=>`⭐ ${parseFloat(s||0).toFixed(1)}`},{key:"isVerified",label:"Status",sortable:!0,formatter:s=>s?'<span class="badge badge-success"><i class="fas fa-check-circle"></i> Verified</span>':'<span class="badge badge-warning"><i class="fas fa-clock"></i> Unverified</span>'},{key:"createdAt",label:"Joined",sortable:!0,formatter:s=>i.formatDate(s)}],a=[{name:"view",icon:"eye",label:"View Details",type:"info"},{name:"verify",icon:"check-circle",label:"Add Badge",type:"success"},{name:"remove-badge",icon:"times-circle",label:"Remove Badge",type:"danger"}];return o.dataTable(t,e,a)},attachTableEventListeners(){document.querySelectorAll("[data-action]").forEach(e=>{e.addEventListener("click",t=>{const a=t.currentTarget.dataset.action,s=t.currentTarget.dataset.id;switch(a){case"view":this.viewProvider(s);break;case"verify":this.addVerificationBadge(s);break;case"remove-badge":this.removeVerificationBadge(s);break}})}),document.querySelectorAll(".pagination-btn").forEach(e=>{e.addEventListener("click",t=>{const a=parseInt(t.currentTarget.dataset.page);a&&a!==this.currentPage&&this.loadProviders(a)})})},setupEventListeners(){document.addEventListener("change",e=>{e.target.dataset.filter&&(this.filters[e.target.dataset.filter]=e.target.value,this.loadProviders(1))}),document.addEventListener("input",i.debounce(e=>{e.target.dataset.filter==="search"&&(this.filters.search=e.target.value,this.loadProviders(1))},500)),document.addEventListener("click",e=>{e.target.closest(".filter-reset")&&(this.filters={},document.querySelectorAll("[data-filter]").forEach(t=>{t.value=""}),this.loadProviders(1))})},async viewProvider(e){const t=this.providers.find(a=>a.id==e);t&&this.showProviderDetailsModal(t)},showProviderDetailsModal(e){var n,r,c;const t=`
            <div class="provider-details">
                <div class="provider-details-header" style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                    <img src="${i.getAvatarUrl(e.businessName,(n=e.user)==null?void 0:n.avatar)}" alt="${e.businessName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.25rem;">${e.businessName||"Unknown Business"}</h3>
                        <p style="margin: 4px 0 0; color: #6b7280;">${((r=e.user)==null?void 0:r.email)||""}</p>
                        ${e.isVerified?'<span class="badge badge-success" style="margin-top: 8px;"><i class="fas fa-check-circle"></i> Verified Provider</span>':'<span class="badge badge-warning" style="margin-top: 8px;"><i class="fas fa-clock"></i> Not Verified</span>'}
                    </div>
                </div>
                <div class="provider-details-body">
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280;">Business Type:</span>
                        <span style="font-weight: 500;">${e.businessType||"N/A"}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280;">Location:</span>
                        <span style="font-weight: 500;">${e.location||"N/A"}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280;">Rating:</span>
                        <span style="font-weight: 500;">⭐ ${parseFloat(e.rating||0).toFixed(1)}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280;">Phone:</span>
                        <span style="font-weight: 500;">${((c=e.user)==null?void 0:c.phone)||"N/A"}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0;">
                        <span style="color: #6b7280;">Joined:</span>
                        <span style="font-weight: 500;">${i.formatDate(e.createdAt)}</span>
                    </div>
                    ${e.description?`
                        <div style="margin-top: 16px;">
                            <span style="color: #6b7280; display: block; margin-bottom: 8px;">Description:</span>
                            <p style="margin: 0; color: #374151;">${e.description}</p>
                        </div>
                    `:""}
                </div>
            </div>
        `,a=o.modal("providerDetailsModal","Provider Details",t,`
            <button class="btn btn-outline modal-close-btn">Close</button>
            ${e.isVerified?`<button class="btn btn-danger" onclick="ProviderVerificationPage.removeVerificationBadge('${e.id}')">Remove Badge</button>`:`<button class="btn btn-success" onclick="ProviderVerificationPage.addVerificationBadge('${e.id}')">Add Verification Badge</button>`}
        `),s=document.getElementById("modalContainer");s.innerHTML=a,s.querySelector(".modal-close").addEventListener("click",()=>{s.innerHTML=""}),s.querySelector(".modal-close-btn").addEventListener("click",()=>{s.innerHTML=""})},async addVerificationBadge(e){i.showConfirm("Add Verification Badge","Are you sure you want to add a verification badge to this service provider? This badge will be visible to travelers.",async()=>{try{await l.post(`/admin/providers/${e}/verify-badge`),i.showToast("Verification badge added successfully","success"),document.getElementById("modalContainer").innerHTML="",this.loadProviders(this.currentPage)}catch{i.showToast("Failed to add verification badge","error")}})},async removeVerificationBadge(e){i.showConfirm("Remove Verification Badge","Are you sure you want to remove the verification badge from this service provider?",async()=>{try{await l.post(`/admin/providers/${e}/remove-badge`),i.showToast("Verification badge removed successfully","success"),document.getElementById("modalContainer").innerHTML="",this.loadProviders(this.currentPage)}catch{i.showToast("Failed to remove verification badge","error")}})},destroy(){}};window.ProviderVerificationPage=E;const P={stories:[],currentPage:1,filters:{},async init(){await this.loadStories(),this.setupEventListeners()},async loadStories(e=1){try{const t=document.getElementById("pageContent");t.innerHTML=o.loadingSpinner("Loading stories...");const a={page:e,limit:d.PAGINATION.DEFAULT_LIMIT,...this.filters},s=await l.get("/admin/stories",a);this.stories=s.stories||[],this.currentPage=e,this.renderStories(s)}catch(t){console.error("Error loading stories:",t);const a=document.getElementById("pageContent");a.innerHTML=`
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Stories</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${t.message||"Unable to connect to the server"}</p>
                    <button class="btn btn-primary" onclick="StoryManagementPage.loadStories()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `,i.showToast("Failed to load stories","error")}},renderStories(e){var a,s,n;const t=document.getElementById("pageContent");t.innerHTML=`
            <div class="story-management-page">
                <!-- Page Header -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Traveler Stories Management</h1>
                        <p class="page-subtitle">Review and approve traveler stories before publishing</p>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-grid stats-grid-3">
                    ${o.statCard("Total Stories",i.formatNumber(((a=e.stats)==null?void 0:a.total)||0),"book-open",null,"primary")}
                    ${o.statCard("Pending Review",i.formatNumber(((s=e.stats)==null?void 0:s.pending)||0),"clock",null,"warning")}
                    ${o.statCard("Published",i.formatNumber(((n=e.stats)==null?void 0:n.approved)||0),"check-circle",null,"success")}
                </div>

                <!-- Filters -->
                ${o.filterBar([{type:"search",key:"search",placeholder:"Search stories..."},{type:"select",key:"status",placeholder:"All Status",options:[{value:"pending",label:"Pending Review"},{value:"approved",label:"Published"}]}])}

                <!-- Stories Grid -->
                <div class="card">
                    <div class="card-body">
                        ${this.renderStoriesGrid(this.stories)}
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container">
                    ${o.pagination(this.currentPage,e.totalPages||1,r=>this.loadStories(r))}
                </div>
            </div>
        `,this.attachEventListeners()},renderStoriesGrid(e){return!e||e.length===0?o.emptyState("book-open","No Stories Found","No traveler stories match your current filters"):`
            <div class="stories-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;">
                ${e.map(t=>this.renderStoryCard(t)).join("")}
            </div>
        `},renderStoryCard(e){var a,s,n,r,c;const t=e.media&&e.media.length>0?typeof e.media[0]=="string"?e.media[0]:(a=e.media[0])==null?void 0:a.url:null;return`
            <div class="story-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                ${t?`
                    <div style="height: 180px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative;">
                        <img src="${t}" alt="${e.title}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div style="position: absolute; top: 12px; right: 12px;">
                            ${e.isApproved?'<span class="badge badge-success"><i class="fas fa-check"></i> Published</span>':'<span class="badge badge-warning"><i class="fas fa-clock"></i> Pending</span>'}
                        </div>
                    </div>
                `:`
                    <div style="height: 180px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; position: relative;">
                        <i class="fas fa-image" style="font-size: 48px; color: rgba(255,255,255,0.5);"></i>
                        <div style="position: absolute; top: 12px; right: 12px;">
                            ${e.isApproved?'<span class="badge badge-success"><i class="fas fa-check"></i> Published</span>':'<span class="badge badge-warning"><i class="fas fa-clock"></i> Pending</span>'}
                        </div>
                    </div>
                `}
                
                <div style="padding: 20px;">
                    <h3 style="margin: 0 0 8px; font-size: 1.1rem; font-weight: 600; color: #1f2937;">${e.title||"Untitled Story"}</h3>
                    
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="${i.getAvatarUrl((s=e.user)==null?void 0:s.name,(n=e.user)==null?void 0:n.avatar)}" alt="${(r=e.user)==null?void 0:r.name}" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-size: 0.875rem; color: #6b7280;">${((c=e.user)==null?void 0:c.name)||"Unknown"}</span>
                    </div>
                    
                    <p style="margin: 0 0 12px; font-size: 0.875rem; color: #6b7280; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${e.story||"No description"}
                    </p>
                    
                    <div style="display: flex; gap: 16px; margin-bottom: 16px; font-size: 0.75rem; color: #9ca3af;">
                        ${e.location?`<span><i class="fas fa-map-marker-alt"></i> ${e.location}</span>`:""}
                        <span><i class="fas fa-heart"></i> ${e.likesCount||0}</span>
                        <span><i class="fas fa-comment"></i> ${e.commentsCount||0}</span>
                    </div>
                    
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-outline" data-action="view" data-id="${e.id}" style="flex: 1;">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${e.isApproved?`
                            <button class="btn btn-sm btn-danger" data-action="delete" data-id="${e.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        `:`
                            <button class="btn btn-sm btn-success" data-action="approve" data-id="${e.id}" style="flex: 1;">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-sm btn-danger" data-action="reject" data-id="${e.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `},attachEventListeners(){document.querySelectorAll("[data-action]").forEach(e=>{e.addEventListener("click",t=>{const a=t.currentTarget.dataset.action,s=t.currentTarget.dataset.id;switch(a){case"view":this.viewStory(s);break;case"approve":this.approveStory(s);break;case"reject":this.rejectStory(s);break;case"delete":this.deleteStory(s);break}})}),document.querySelectorAll(".pagination-btn").forEach(e=>{e.addEventListener("click",t=>{const a=parseInt(t.currentTarget.dataset.page);a&&a!==this.currentPage&&this.loadStories(a)})})},setupEventListeners(){document.addEventListener("change",e=>{e.target.dataset.filter&&(this.filters[e.target.dataset.filter]=e.target.value,this.loadStories(1))}),document.addEventListener("input",i.debounce(e=>{e.target.dataset.filter==="search"&&(this.filters.search=e.target.value,this.loadStories(1))},500)),document.addEventListener("click",e=>{e.target.closest(".filter-reset")&&(this.filters={},document.querySelectorAll("[data-filter]").forEach(t=>{t.value=""}),this.loadStories(1))})},viewStory(e){const t=this.stories.find(a=>a.id==e);t&&this.showStoryDetailsModal(t)},showStoryDetailsModal(e){var r,c,p,v,u,h;const t=e.media&&e.media.length>0?typeof e.media[0]=="string"?e.media[0]:(r=e.media[0])==null?void 0:r.url:null,a=`
            <div class="story-details">
                ${t?`
                    <div style="margin: -20px -20px 20px; height: 250px;">
                        <img src="${t}" alt="${e.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                `:""}
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <img src="${i.getAvatarUrl((c=e.user)==null?void 0:c.name,(p=e.user)==null?void 0:p.avatar)}" alt="${(v=e.user)==null?void 0:v.name}" style="width: 48px; height: 48px; border-radius: 50%;">
                    <div>
                        <h4 style="margin: 0; font-size: 1rem;">${((u=e.user)==null?void 0:u.name)||"Unknown"}</h4>
                        <p style="margin: 4px 0 0; font-size: 0.875rem; color: #6b7280;">${((h=e.user)==null?void 0:h.email)||""}</p>
                    </div>
                    ${e.isApproved?'<span class="badge badge-success" style="margin-left: auto;"><i class="fas fa-check"></i> Published</span>':'<span class="badge badge-warning" style="margin-left: auto;"><i class="fas fa-clock"></i> Pending Review</span>'}
                </div>
                
                <h3 style="margin: 0 0 12px; font-size: 1.25rem;">${e.title||"Untitled Story"}</h3>
                
                <div style="display: flex; gap: 16px; margin-bottom: 16px; font-size: 0.875rem; color: #6b7280;">
                    ${e.location?`<span><i class="fas fa-map-marker-alt"></i> ${e.location}</span>`:""}
                    ${e.duration?`<span><i class="fas fa-clock"></i> ${e.duration}</span>`:""}
                </div>
                
                <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0; line-height: 1.6; color: #374151;">${e.story||"No content"}</p>
                </div>
                
                ${e.highlights&&e.highlights.length>0?`
                    <div style="margin-bottom: 16px;">
                        <h4 style="margin: 0 0 8px; font-size: 0.875rem; color: #6b7280;">Highlights:</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${e.highlights.map($=>`<span class="badge badge-primary">${$}</span>`).join("")}
                        </div>
                    </div>
                `:""}
                
                <div style="display: flex; gap: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280;">
                    <span><i class="fas fa-heart"></i> ${e.likesCount||0} likes</span>
                    <span><i class="fas fa-comment"></i> ${e.commentsCount||0} comments</span>
                    <span><i class="fas fa-calendar"></i> ${i.formatDate(e.createdAt)}</span>
                </div>
            </div>
        `,s=o.modal("storyDetailsModal","Story Details",a,`
            <button class="btn btn-outline modal-close-btn">Close</button>
            ${e.isApproved?`
                <button class="btn btn-danger" onclick="StoryManagementPage.deleteStory('${e.id}')">Delete Story</button>
            `:`
                <button class="btn btn-danger" onclick="StoryManagementPage.rejectStory('${e.id}')">Reject</button>
                <button class="btn btn-success" onclick="StoryManagementPage.approveStory('${e.id}')">Approve & Publish</button>
            `}
        `),n=document.getElementById("modalContainer");n.innerHTML=s,n.querySelector(".modal-close").addEventListener("click",()=>{n.innerHTML=""}),n.querySelector(".modal-close-btn").addEventListener("click",()=>{n.innerHTML=""})},async approveStory(e){i.showConfirm("Approve Story","Are you sure you want to approve and publish this story? It will be visible to all travelers.",async()=>{try{await l.post(`/admin/stories/${e}/approve`),i.showToast("Story approved and published successfully","success"),document.getElementById("modalContainer").innerHTML="",this.loadStories(this.currentPage)}catch{i.showToast("Failed to approve story","error")}})},async rejectStory(e){i.showConfirm("Reject Story","Are you sure you want to reject this story? It will not be published.",async()=>{try{await l.post(`/admin/stories/${e}/reject`),i.showToast("Story rejected successfully","success"),document.getElementById("modalContainer").innerHTML="",this.loadStories(this.currentPage)}catch{i.showToast("Failed to reject story","error")}})},async deleteStory(e){i.showConfirm("Delete Story","Are you sure you want to permanently delete this story? This action cannot be undone.",async()=>{try{await l.delete(`/admin/stories/${e}`),i.showToast("Story deleted successfully","success"),document.getElementById("modalContainer").innerHTML="",this.loadStories(this.currentPage)}catch{i.showToast("Failed to delete story","error")}})},destroy(){}};window.StoryManagementPage=P;class J{constructor(){this.currentPage=null,this.pages={dashboard:y,analytics:L,users:g,travelers:A,providers:I,services:b,"service-approval":f,bookings:N,payments:x,settings:S,categories:k,destinations:D,"pre-orders":R,"booking-calendar":O,transactions:B,revenue:M,payouts:U,"user-verification":_,content:F,promotions:T,reviews:H,notifications:j,support:V,feedback:G,"activity-logs":Y,reports:q,admins:K,"system-health":z,"trusted-partners":W,"provider-verification":E,"story-management":P}}async init(){setTimeout(()=>{document.getElementById("loadingScreen").classList.add("hidden"),document.getElementById("mainApp").classList.remove("hidden")},1e3),this.setupNavigation(),this.setupSidebar(),this.setupTheme();const t=window.location.hash.substring(1)||"dashboard";await this.navigateTo(t),await this.updateStats(),window.addEventListener("hashchange",()=>{const a=window.location.hash.substring(1)||"dashboard";this.navigateTo(a)})}setupNavigation(){var t,a;document.querySelectorAll(".nav-item").forEach(s=>{s.addEventListener("click",n=>{n.preventDefault();const r=s.dataset.page;r&&(window.location.hash=r)})}),(t=document.getElementById("logoutBtn"))==null||t.addEventListener("click",()=>{i.showConfirm("Logout","Are you sure you want to logout?",async()=>{await l.logout(),window.location.reload()})}),(a=document.getElementById("themeToggle"))==null||a.addEventListener("click",()=>{this.toggleTheme()})}setupSidebar(){const t=document.getElementById("sidebar"),a=document.getElementById("sidebarToggle"),s=document.getElementById("mobileSidebarToggle");a==null||a.addEventListener("click",()=>{t.classList.toggle("collapsed"),localStorage.setItem(d.STORAGE_KEYS.SIDEBAR_STATE,t.classList.contains("collapsed")?"collapsed":"expanded")}),s==null||s.addEventListener("click",()=>{t.classList.toggle("mobile-open")}),document.addEventListener("click",r=>{window.innerWidth<=1024&&!t.contains(r.target)&&!s.contains(r.target)&&t.classList.remove("mobile-open")}),localStorage.getItem(d.STORAGE_KEYS.SIDEBAR_STATE)==="collapsed"&&t.classList.add("collapsed")}setupTheme(){localStorage.getItem(d.STORAGE_KEYS.THEME)==="dark"&&(document.documentElement.setAttribute("data-theme","dark"),document.getElementById("themeToggle").innerHTML='<i class="fas fa-sun"></i>')}toggleTheme(){const a=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",a),localStorage.setItem(d.STORAGE_KEYS.THEME,a);const s=document.getElementById("themeToggle");s.innerHTML=a==="dark"?'<i class="fas fa-sun"></i>':'<i class="fas fa-moon"></i>'}async navigateTo(t){this.currentPage&&this.currentPage.destroy&&this.currentPage.destroy(),document.querySelectorAll(".nav-item").forEach(n=>{n.classList.remove("active"),n.dataset.page===t&&n.classList.add("active")});const a=document.getElementById("breadcrumbText");a&&(a.textContent=this.formatPageName(t));const s=this.pages[t];if(s){this.currentPage=s;try{await s.init()}catch(n){console.error(`Error loading page ${t}:`,n),this.showErrorPage()}}else this.show404Page()}formatPageName(t){return t.split("-").map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join(" ")}showErrorPage(){var a;const t=document.getElementById("pageContent");t.innerHTML=o.emptyState("exclamation-triangle","Error Loading Page","Something went wrong. Please try again.",{action:"reload",icon:"redo",label:"Reload Page"}),(a=document.querySelector('[data-action="reload"]'))==null||a.addEventListener("click",()=>{window.location.reload()})}show404Page(){var a;const t=document.getElementById("pageContent");t.innerHTML=o.emptyState("map-marked-alt","Page Not Found","The page you are looking for does not exist.",{action:"home",icon:"home",label:"Go to Dashboard"}),(a=document.querySelector('[data-action="home"]'))==null||a.addEventListener("click",()=>{window.location.hash="dashboard"})}async updateStats(){try{const t=await l.getUserStats(),a=t.stats||t;document.getElementById("totalUsersCount").textContent=a.total||0,document.getElementById("travelersCount").textContent=a.travelers||0,document.getElementById("providersCount").textContent=a.providers||0;const s=await l.getServiceStats(),n=s.stats||s;document.getElementById("totalServicesCount").textContent=n.total||0,document.getElementById("pendingServicesCount").textContent=n.pending||0;const r=await l.getBookingStats(),c=r.stats||r;document.getElementById("totalBookingsCount").textContent=c.total||0,document.getElementById("preOrdersCount").textContent=c.pending||0}catch(t){console.error("Error updating stats:",t)}}}document.addEventListener("DOMContentLoaded",()=>{new J().init()})});export default Z();
