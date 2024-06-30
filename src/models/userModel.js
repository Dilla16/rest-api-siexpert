class User {
  constructor(sesa, name, badge, email, password, role, avatar, created_by, created_at) {
    this.sesa = sesa;
    this.name = name;
    this.badge = badge;
    this.email = email;
    this.password = password;
    this.role = role;
    this.avatar = avatar;
    this.created_by = created_by;
    this.created_at = created_at;
  }
}

module.exports = User;
