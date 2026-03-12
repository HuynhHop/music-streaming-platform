const ETypeRole = Object.freeze({
    ADMIN: 1,
    USER: 2,

    fromValue(value) {
        const role = Object.entries(ETypeRole).find(([key, val]) => val === value);
        return role ? role[0] : null;
    },

    toValue(roleName) {
        const role = ETypeRole[roleName];
        return role !== undefined ? role : null; 
    }
});
  

module.exports = ETypeRole;