export default function (url) {
  return (page, script) =>
    fetch(`${url}/content`, {
      method: "POST",
      body: JSON.stringify({
        url: page,
        script,
      }),
    }).then((res) => res.json());
}
