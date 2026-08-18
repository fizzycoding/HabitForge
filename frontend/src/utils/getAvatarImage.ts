export function getAvatarImage(avatarId?: string): string {
  if (!avatarId) {
    return '/avatar/avatar-1.png';
  }

  if (avatarId.startsWith('/') || avatarId.startsWith('http')) {
    return avatarId;
  }

  const clean = avatarId.toLowerCase().replace(/_|\./g, '-');

  if (clean.includes('avatar-1') || clean.includes('avatar-01')) {
    return '/avatar/avatar-1.png';
  }
  if (clean.includes('avatar-2') || clean.includes('avatar-02')) {
    return '/avatar/avatar-2.png';
  }
  if (clean.includes('avatar-3') || clean.includes('avatar-03')) {
    return '/avatar/avatar-3.png';
  }
  if (clean.includes('avatar-4') || clean.includes('avatar-04')) {
    return '/avatar/avatar-4.png';
  }
  if (clean.includes('avatar-5') || clean.includes('avatar-05')) {
    return '/avatar/avatar-5.png';
  }

  return `/avatar/${avatarId}.png`;
}
