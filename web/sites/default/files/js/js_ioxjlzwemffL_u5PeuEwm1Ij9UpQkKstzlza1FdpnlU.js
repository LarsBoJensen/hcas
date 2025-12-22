/* @license GPL-2.0-or-later https://www.drupal.org/licensing/faq */
(function($,Drupal){Drupal.behaviors.layoutParagraphsComponentForm={attach:function attach(context){$('[name="layout_paragraphs[layout]"]').on('change',(e)=>{$('.lpb-btn--save').prop('disabled',e.currentTarget.disabled);});$('.lpb-btn--save').prop('disabled',false);}};})(jQuery,Drupal);;
