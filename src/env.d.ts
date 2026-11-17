// Native media lazy loading is in the HTML standard; Astro's bundled JSX
// attributes do not yet declare it. Browsers without support load normally.
// https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video#loading
 declare namespace astroHTML.JSX {
  interface VideoHTMLAttributes { loading?: 'eager' | 'lazy' | null; }
 }
