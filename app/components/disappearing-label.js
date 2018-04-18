import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import { cancel, later } from '@ember/runloop';

export default Component.extend({
  attributeBindings: ['data-test-disappearing-label'],
  'data-test-disappearing-label': true,

  /**
   * Time (in milliseconds) to show the message before disappearing
   * @property timeout
   * @type {Number}
   * @public
   */
  timeout: 2000,

  /**
   * Ember's default handling of visibility of a component
   * @property isVisible
   * @type {Boolean}
   * @public
   * @see https://emberjs.com/api/ember/3.0/classes/Component/properties/isVisible?anchor=isVisible
   */
  isVisible: false,

  /**
   * Tracks the current timer in use by the Ember run loop for cancellation purposes
   * @property _currentTimer
   * @type {Object}
   * @private
   */
  _currentTimer: null,

  /**
   * Trigger property to show the disappearing label (simplistic example)
   * @property showMessage
   * @type {Boolean}
   * @public
   */
  showMessage: computed('isVisible', {
    get() {
      return get(this, 'isVisible');
    },
    set(key, value) {
      if (value) {
        if (get(this, 'isVisible')) {
          return value;
        }
        set(this, 'isVisible', true);
        this._scheduleHide();
      }
      return value;
    }
  }),

  /**
   * Cleans up any outstanding timers upon removal
   * @method willDestroy
   * @public
   */
  willDestroy() {
    this._clearTimer();
  },

  /**
   * Automatic event handler that listens for mouseEnter jQuery event over the component
   * @method mouseEnter
   * @public
   */
  mouseEnter() {
    if (get(this, 'isVisible')) {
      this._clearTimer();
    }
  },

  /**
   * Automatic event handler that listens for mouseLeave jQuery event over the component
   * @method mouseLeave
   * @public
   */
  mouseLeave() {
    if (get(this, 'isVisible')) {
      this._scheduleHide();
    }
  },

  /**
   * Clears the existing run loop timer
   * @method _clearTimer
   * @private
   */
  _clearTimer() {
    let timer = get(this, '_currentTimer');
    if (!timer) {
      return;
    }
    cancel(timer);
    set(this, '_currentTimer', null);
  },

  /**
   * Schedules the hiding of the component
   * @method _scheduleHide
   * @private
   */
  _scheduleHide() {
    let timer = later(this, () => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      set(this, 'isVisible', false);
      set(this, '_currentTimer', null);
    }, get(this, 'timeout'));
    set(this, '_currentTimer', timer);
  }
});
