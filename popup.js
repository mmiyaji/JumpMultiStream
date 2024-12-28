// 除外するパスリスト
const excludedPaths = ["directory", "turbo", "p", "downloads", "jobs", "privacy", "search"];

// タブの情報を取得してユーザーIDリストを生成
chrome.tabs.query({}, (tabs) => {
  const userList = document.getElementById("userList");

  // TwitchユーザーIDを抽出
  const twitchUsers = tabs
    .filter(tab => {
      if (!tab.url) return false;

      const url = new URL(tab.url);

      // サブドメインがwww, m, またはサブドメインなしの場合のみ許可
      const hostnameParts = url.hostname.split(".");
      const subdomain = hostnameParts.length === 3 ? hostnameParts[0] : null;
      const domain = hostnameParts.slice(-2).join("."); // twitch.tvに対応

      if (domain !== "twitch.tv") return false; // twitch.tvドメイン以外を除外
      if (subdomain && !["www", "m"].includes(subdomain)) return false; // www, m以外のサブドメインを除外

      // パスのセグメントを抽出し、除外リストに含まれるものを除外
      const pathSegments = url.pathname.split("/").filter(segment => segment);
      return pathSegments.length > 0 && !excludedPaths.includes(pathSegments[0]);
    })
    .map(tab => {
      const url = new URL(tab.url);
      const pathSegments = url.pathname.split("/").filter(segment => segment);
      return pathSegments.length > 0 ? pathSegments[0] : null; // 最初のセグメントをユーザIDとする
    })
    .filter(user => user); // null を除外

  if (twitchUsers.length === 0) {
    // ユーザーIDが見つからない場合、ポップアップにメッセージを表示
    const noUsersMessage = document.createElement("p");
    noUsersMessage.textContent = "The Twitch user you are viewing cannot be found. Please open the streaming page in a another tab.";
    noUsersMessage.className = "text-danger text-center mt-3";
    userList.appendChild(noUsersMessage);
    return;
  }

  // ユーザーIDをチェックボックスリストとして表示
  twitchUsers.forEach(user => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `checkbox-${user}`; // ユニークなIDを設定
    checkbox.value = user;
    checkbox.checked = true; // デフォルトで選択状態
    checkbox.className = "form-check-input me-2";

    const label = document.createElement("label");
    label.htmlFor = `checkbox-${user}`; // ラベルのfor属性をチェックボックスIDに紐付け
    label.textContent = user;
    label.className = "form-check-label";

    listItem.appendChild(checkbox);
    listItem.appendChild(label);
    userList.appendChild(listItem);
  });
});

// ボタンのクリックイベントで新しいタブを開く
document.getElementById("openMultiStream").addEventListener("click", () => {
  const selectedUsers = Array.from(document.querySelectorAll("#userList input:checked"))
    .map(input => input.value);

  if (selectedUsers.length > 0) {
    const multiStreamUrl = `https://multistre.am/${selectedUsers.join("/")}/`;
    chrome.tabs.create({ url: multiStreamUrl });
  } else {
    alert("Please select at least one user.");
  }
});
