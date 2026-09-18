import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ─── TYPES ───────────────────────────────── */

export interface UpdateProfilePayload {
    first_name?: string;
    last_name?: string;
    email?: string;

    current_password?: string;

    password?: string;
    password_confirmation?: string;
}

export interface UpdateProfileResponse {
    message: string;
    user: Record<string, any>;
}

/* ─── UPDATE PROFILE ─────────────────────── */

export async function updateProfile(
    payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
    const { data } = await api.put('/profile/update', payload);

    console.log('Profile update response:', data);

    return data;
}

/* ─── UPLOAD PROFILE PHOTO ───────────────── */

export async function uploadProfilePhoto(
    image: any,
    mimeType?: string
): Promise<{
    message: string;
    new_photo: string;
    new_photo_url: string;
}> {
    const formData = new FormData();

    try {
        /* ─── WEB (expo --web) ───────────────── */

        if (image?.uri?.startsWith('blob:')) {
            const response = await fetch(image.uri);
            const blob = await response.blob();

            const filename =
                image.fileName ??
                `photo-${Date.now()}.jpg`;

            formData.append(
                'photo',
                blob,
                filename
            );
        }

        /* ─── MOBILE (Android / iOS) ─────────── */

        else {
            const imageUri = typeof image === 'string' ? image : image.uri;

            const filename = imageUri.split('/').pop() ?? `photo-${Date.now()}.jpg`;

            const getMimeType = (uri: string) => {
                const extension = uri.split('.').pop()?.toLowerCase();

                switch (extension) {
                    case 'jpg':
                    case 'jpeg':
                        return 'image/jpeg';

                    case 'png':
                        return 'image/png';

                    case 'webp':
                        return 'image/webp';

                    default:
                        return 'image/jpeg';
                }
            };

            const finalMimeType =
                mimeType ??
                getMimeType(imageUri);

            formData.append('photo', {
                uri: imageUri,
                type: finalMimeType,
                name: filename,
            } as any);
        }

        const res = await api.post(
            '/profile/photo',
            formData,
            {
                headers: {
                    'Content-Type':
                        'multipart/form-data',
                },
            }
        );

        console.log('Photo upload response:', res.data);
        return res.data;

    } catch (error: any) {
        console.error(
            'Photo upload error:',
            error.response?.data ??
            error.message
        );

        throw error;
    }
}

/* ─── DELETE ACCOUNT ─────────────────────── */

export async function deleteAccount(): Promise<void> {
    await api.delete('/profile/delete');

    await AsyncStorage.removeItem('token');
}