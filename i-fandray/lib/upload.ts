export async function getUploadSignature(bodyParams: Record<string, any> = {}) {
  const res = await fetch('/api/uploads/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyParams),
  });
  if (!res.ok) throw new Error('Failed to get upload signature');
  return res.json();
}

export async function uploadToCloudinary(file: File, options: Record<string, any> = {}) {
  const { signature, apiKey, cloudName, timestamp } = await getUploadSignature(options);
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  if (options.folder) form.append('folder', options.folder);
  if (options.public_id) form.append('public_id', options.public_id);

  const response = await fetch(url, { method: 'POST', body: form });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}
