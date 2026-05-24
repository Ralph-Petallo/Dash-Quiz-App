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
    imageUri: string,
    mimeType?: string
): Promise<{
    message: string;
    new_photo: string;
    new_photo_url: string;
}> {
    const filename = imageUri.split('/').pop() ?? `photo-${Date.now()}`;

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

    const finalMimeType = mimeType ?? getMimeType(imageUri);

    const formData = new FormData();

    formData.append('photo', {
        uri: imageUri,
        type: finalMimeType,
        name: filename,
    } as any);

    const res = await api.post('/profile/photo', formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    console.log('Photo upload response:', res.data);
    return res.data;
}

/* ─── DELETE ACCOUNT ─────────────────────── */
export async function deleteAccount(): Promise<void> {
    await api.delete('/profile/delete');

    await AsyncStorage.removeItem('token');
}