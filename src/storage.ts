/** Tab drafts are optional; blocked/full storage must not break a lesson. */
export function loadText(key:string){try{return sessionStorage.getItem(key)||'';}catch{return '';}}
export function saveText(key:string,value:string){try{sessionStorage.setItem(key,value);return true;}catch{return false;}}
export function removeText(key:string){try{sessionStorage.removeItem(key);}catch{/* In-memory learning remains usable. */}}
export function clearUserDrafts(id:string){try{for(const key of Object.keys(sessionStorage))if(key.startsWith(`sumi:${id}:`))sessionStorage.removeItem(key);}catch{/* Storage may be disabled by browser policy. */}}
