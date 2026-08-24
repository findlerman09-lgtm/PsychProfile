/* PsychProfile deployment configuration.

   The Formspree form endpoint is intentionally public configuration, not a
   secret. Do not place Formspree API keys, email passwords, GitHub tokens, or
   other credentials in this repository.
*/
window.PSYCHPROFILE_CONFIG = Object.freeze({
  deliveryProvider: 'formspree',
  formEndpoint: 'https://formspree.io/f/xppagqnp'
});
