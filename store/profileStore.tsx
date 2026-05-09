import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
    first_name?: string;
    last_name?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
    new_password_confirmation?: string;
}

export interface UpdateProfileResponse {
    message: string;
    user: Record<string, any>;
}

// ─── Update profile (name / email / password) ─────────────────────────────────

export async function updateProfile(
    payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
    const { data } = await api.put('/profile/update', payload);
    return data;
}

// ─── Upload profile photo ─────────────────────────────────────────────────────

export async function uploadProfilePhoto(
    imageUri: string,
    mimeType?: string
): Promise<{ message: string; profile_photo: string }> {

    const filename = imageUri.split('/').pop() ?? `photo-${Date.now()}`;

    // Auto-detect MIME type if not provided
    const getMimeType = (uri: string) => {
        const ext = uri.split('.').pop()?.toLowerCase();

        switch (ext) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'webp':
                return 'image/webp';
            default:
                return 'image/jpeg'; // fallback
        }
    };

    const finalMimeType = mimeType ?? getMimeType(imageUri);

    const formData = new FormData();
    formData.append('profile_photo', {
        uri: imageUri,
        type: finalMimeType,
        name: filename,
    } as any);

    const { data } = await api.post('/profile/photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return data;
}

// ─── Delete account ───────────────────────────────────────────────────────────

export async function deleteAccount(): Promise<void> {
    await api.delete('/profile/delete');
    await AsyncStorage.removeItem('token');
}