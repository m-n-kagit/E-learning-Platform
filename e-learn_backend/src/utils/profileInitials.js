const buildProfileInitial = (name = "") => {
  const cleanName = String(name || "").trim();
  if (!cleanName) return "";

  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return cleanName.slice(0, 1).toUpperCase();
};

export default buildProfileInitial;
