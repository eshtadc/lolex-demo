import Component from '@ember/component';
import { get, set } from '@ember/object';
import { cancel, later } from '@ember/runloop';

export default Component.extend({
  timeout: 2000,
  isVisible: false,
  _currentTimer: null,

  didInsertElement() {
    this._showLabel();
  },

  willDestroy() {
    this._clearTimer();
  },

  mouseEnter() {
    console.log('mouse enter');
    this._clearTimer();
    if (get(this, 'isVisible')) {
      this._showLabel(false);
    }
  },

  mouseLeave() {
    console.log('mouse leave');
    if (get(this, 'isVisible')) {
      this._scheduleHide();
    }
  },

  _showLabel(autoHide = true) {
    if (get(this, 'isVisible')) {
      return;
    }
    set(this, 'isVisible', true);
    if (autoHide) {
      this._scheduleHide();
    }
  },

  _clearTimer() {
    let timer = get(this, '_currentTimer');
    if (!timer) {
      return false;
    }
    cancel(timer);
    set(this, '_currentTimer', null);
    return true;
  },

  _scheduleHide() {
    let timer = later(this, () => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      set(this, 'isVisible', false);
      set(this, '_currenTimer', null);
    }, get(this, 'timeout'));
    set(this, '_currentTimer', timer);
  }
});
