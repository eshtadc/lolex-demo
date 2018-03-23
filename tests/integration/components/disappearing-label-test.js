import { setupRenderingTest } from 'ember-qunit';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { Promise } from 'rsvp';
import lolex from 'lolex';
import hbs from 'htmlbars-inline-precompile';
// https://github.com/emberjs/ember-test-helpers/pull/317/files

const nextTick = setTimeout;
function finishRender() {
  return new Promise(resolve => {
    nextTick(resolve);
  });
}

function labelIsHidden() {
  return find('[data-test-disappearing-label]').style.display === 'none';
}

module('Integration | Component | disappearing label', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.clock = lolex.install();
    this.timeout = 2000;
  });

  hooks.afterEach(function() {
    this.clock.tick(this.timeout + 1);
    this.clock.uninstall();
  });

  test('it renders', async function(assert) {
    await render(hbs`{{disappearing-label}}`);
    assert.ok(find('[data-test-disappearing-label]'), 'It renders');
    assert.equal(this.element.textContent.trim(), 'Hi ho, Kermit the Frog here!', 'Default message is ready for display');
  });

  test('it shows the notification for the configured period of time', async function(assert) {
    render(hbs`{{disappearing-label timeout=timeout showMessage=true}}`);
    await finishRender();
    assert.notOk(labelIsHidden(), 'Message is shown when element is added');

    this.clock.tick(3000);
    assert.ok(labelIsHidden(), 'The text is automatically hidden after timeout value.');
  });

  test('it resets the timeout for hiding message upon hover', async function(assert) {
    render(hbs`{{disappearing-label timeout=timeout showMessage=true}}`);
    await finishRender();
    assert.notOk(labelIsHidden(), 'Message is shown when element is added');

    this.clock.tick(1000);

    triggerEvent(find('[data-test-disappearing-label]'), 'mouseover');
    await finishRender();

    this.clock.tick(2500);

    assert.notOk(labelIsHidden(), 'Message is still visible after the timeout threshhold when the user is hovered');

    triggerEvent(find('[data-test-disappearing-label]'), 'mouseout');
    await finishRender();

    this.clock.tick(1000);
    assert.notOk(labelIsHidden(), 'Message is still visible after leaving the element during the timeout period.');

    this.clock.tick(2500);
    assert.ok(labelIsHidden(), 'Message is automatically hidden after the timeout value from when the user left the element.');
  });
});
