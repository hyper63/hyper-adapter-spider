export default function (
  { url, body, type = "application/json", sub, aud, secret },
) {
  // TODO: generate sha from body as id
  const token = jwt.sign({ sub, aud }, secret);
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": type,
      Authorization: `Bearer ${token}`,
    },
    body,
  }).then((res) => res.json());
}
