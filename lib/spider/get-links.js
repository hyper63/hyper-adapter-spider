export default function (url) {
  return (src) =>
    fetch(`${url}/links?url=${src}`, {
      method: "POST",
    }).then((res) => res.json())
      .then(({ links }) => links);
}
