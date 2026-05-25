// 测试代码 - 已优化
function processUserData(users) {
  if (!Array.isArray(users)) {
    return [];
  }

  return users
    .filter(user => user != null && user.age >= 18 && user.name)
    .map(({ name, age }) => ({ name, age }));
}

function calculateTotal(items) {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((total, item) => {
    if (item != null && item.price != null && item.quantity != null) {
      return total + item.price * item.quantity;
    }
    return total;
  }, 0);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatUserList(users) {
  if (!Array.isArray(users)) {
    return '';
  }

  return users
    .filter(user => user != null)
    .map(user => `<div class="user"><span class="name">${escapeHtml(user.name)}</span><span class="age">${user.age}</span></div>`)
    .join('');
}

module.exports = {
  processUserData,
  calculateTotal,
  formatUserList
};
