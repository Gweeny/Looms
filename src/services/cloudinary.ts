const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadPhoto(base64: string): Promise<string> {
  const clean = base64
    .replace(/^data:image\/\w+;base64,/, "")
    .replace(/\s/g, "");

  const body = new FormData();
  body.append("file", `data:image/jpeg;base64,${clean}`);
  body.append("upload_preset", UPLOAD_PRESET ?? "");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cloudinary ${response.status}: ${details}`);
  }

  const data = await response.json();
  return data.secure_url;
}
