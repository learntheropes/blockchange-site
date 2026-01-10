
// HABLED ON CLUDFLARE

// import { sendRedirect, getRequestURL } from 'h3';

// const { public: { isDeployed } } = useRuntimeConfig();

// export default defineEventHandler( async event => {
//   if (isDeployed) {
//     const protocol = getRequestURL(event).protocol;
//     const host = getRequestURL(event).host;
//     const path = getRequestURL(event).pathname;
//     if (!host.startsWith('www') &&
//         !path.startsWith('/api/')) {
//       await sendRedirect(event, `${protocol}//www.${host}${path}`);
//     }
//   }
// })

export default defineEventHandler(async event => { return })