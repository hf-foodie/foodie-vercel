export function postImageUrl(postId: string | number | undefined, name: string) {
  return name?.startsWith('/post-images/') ? `/api/backend${name}` : `/images/posts/${postId}/${name}.png`
}
