export default function (url) {
  return (page, script) => {
    return fetch(`${url}/content`, {
      method: "POST",
      body: JSON.stringify({
        url: page,
        script: atob(script),
      }),
    }).then((res) => res.json());
  };
}
