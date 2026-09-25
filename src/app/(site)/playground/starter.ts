// What a first visit lands on: something rendered, three mixins, the two
// import lines a real component uses. Short enough to read in one glance.
export const STARTER_HTML = `<section class="my-card">
  <h2 class="my-card-title">Hello from cia</h2>
  <p>Edit the HTML and SCSS on the left. The preview recompiles as you type.</p>
  <div class="my-actions">
    <button class="my-btn" type="button">Primary</button>
    <button class="my-btn-ghost" type="button">Ghost</button>
  </div>
</section>
`;

export const STARTER_SCSS = `// Component stylesheet: the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-card {
  @include cia.card-base;
  @include cia.stack(3);
  max-inline-size: 28rem;
}

.my-card-title {
  @include cia.font(semibold, 5);
  margin: 0;
}

.my-actions {
  @include cia.cluster(2);
}

.my-btn       { @include cia.btn(primary); }
.my-btn-ghost { @include cia.btn(ghost); }
`;
