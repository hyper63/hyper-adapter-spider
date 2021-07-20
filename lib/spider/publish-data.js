// publish meta data for document
export default function ({ url, body, secret, sub, aud }) {
  // TODO: use id generated from content to name
  // meta data file
  const token = jwt.sign({ sub, aud }, secret);
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
}
