import { setupRenderingTest } from 'ember-qunit';
import { find, render, triggerEvent, waitUntil, getSettledState } from '@ember/test-helpers';
import { module, test } from 'qunit';
import lolex from 'lolex';
import hbs from 'htmlbars-inline-precompile';

/**
 * Helper function that checks to make sure all state has settled EXCEPT
 * any timers pending in the run loop.
 * @method finishRender
 * @private
 * @returns {Promise}
 */
function finishRender() {
  return waitUntil(() => {
    let { hasRunLoop, hasPendingRequests, hasPendingWaiters } = getSettledState();
    if (hasRunLoop || hasPendingRequests || hasPendingWaiters) {
      return false;
    }
    return true;
  });
}

/**
 * Helper function to check if the label component is current visible (true) or hidden (false)
 * @method labelIsVisible
 * @private
 * @returns {Boolean}
 */
function labelIsVisible() {
  return find('[data-test-disappearing-label]').style.display !== 'none';
}

module('Integration | Component | disappearing label', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.clock = lolex.install();// { shouldAdvanceTime: true }); (can't override "Date")
    this.timeout = 2000;
  });

  hooks.afterEach(function() {
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
    assert.ok(labelIsVisible(), 'Message is shown when element is added');

    this.clock.tick(3000);
    assert.notOk(labelIsVisible(), 'The text is automatically hidden after timeout value.');
  });

  test('it resets the timeout for hiding message upon hover', async function(assert) {
    render(hbs`{{disappearing-label timeout=timeout showMessage=true}}`);
    await finishRender();
    assert.ok(labelIsVisible(), 'Message is shown when element is added');

    this.clock.tick(1000);

    await triggerEvent(find('[data-test-disappearing-label]'), 'mouseover');

    this.clock.tick(2500);

    assert.ok(labelIsVisible(), 'Message is still visible after the timeout threshold when the user is hovered');

    triggerEvent(find('[data-test-disappearing-label]'), 'mouseout');
    await finishRender();

    this.clock.tick(1000);
    assert.ok(labelIsVisible(), 'Message is still visible after leaving the element during the timeout period.');

    this.clock.tick(2500);
    assert.notOk(labelIsVisible(), 'Message is automatically hidden after the timeout value from when the user left the element.');
  });
});
