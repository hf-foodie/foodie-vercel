import { clientFetch } from "@/lib/clientFetch";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

export const getCurrentUser = async () => {
    const res = await clientFetch(`${baseUrl}/me`);
    if (res.ok) {
        return await res.json();
    }
    return null;
};

export const addComment = async (postId: string, content: string, parentCommentId: string | null = null) => {
    const res = await clientFetch(`${baseUrl}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content,
            parentCommentId
        })
    });
    return res;
};

export const deleteComment = async (postId: string, commentId: string) => {
    return clientFetch(`${baseUrl}/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
};
