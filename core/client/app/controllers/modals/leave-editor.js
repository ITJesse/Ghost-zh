import Ember from 'ember';

export default Ember.Controller.extend({
    notifications: Ember.inject.service(),

    args: Ember.computed.alias('model'),

    actions: {
        confirmAccept: function () {
            var args = this.get('args'),
                editorController,
                model,
                transition;

            if (Ember.isArray(args)) {
                editorController = args[0];
                transition = args[1];
                model = editorController.get('model');
            }

            if (!transition || !editorController) {
                this.get('notifications').showError('抱歉，系统故障。请将此问题提交至 Ghost 开发团队。');
                return true;
            }

            // definitely want to clear the data store and post of any unsaved, client-generated tags
            model.updateTags();

            if (model.get('isNew')) {
                // the user doesn't want to save the new, unsaved post, so delete it.
                model.deleteRecord();
            } else {
                // roll back changes on model props
                model.rollback();
            }

            // setting isDirty to false here allows willTransition on the editor route to succeed
            editorController.set('isDirty', false);

            // since the transition is now certain to complete, we can unset window.onbeforeunload here
            window.onbeforeunload = null;

            transition.retry();
        },

        confirmReject: function () {
        }
    },

    confirm: {
        accept: {
            text: '离开此页',
            buttonClass: 'btn btn-red'
        },
        reject: {
            text: '留在此页',
            buttonClass: 'btn btn-default btn-minor'
        }
    }
});
