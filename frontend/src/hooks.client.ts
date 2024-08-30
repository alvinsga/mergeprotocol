// import { authStore, pb } from '$lib/pocketbase';

// pb.authStore.loadFromCookie(document.cookie);
// pb.authStore.onChange(() => {
// 	authStore.set({ isLoggedIn: pb.authStore.isValid, userId: pb.authStore.model?.id ?? '' });
// 	document.cookie = pb.authStore.exportToCookie({
// 		httpOnly: false,
// 		sameSite: 'Lax',
// 		secure: true
// 	});
// });
