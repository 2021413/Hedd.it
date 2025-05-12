export default (policyContext, config, { strapi }) => {
  if (policyContext.state.user) {
    // si l'utilisateur est authentifié, on autorise la requête
    return true;
  }

  return false;
}; 