import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProfileEditForm from '../../../../app/components/profile/ProfileEditForm.vue';

describe('ProfileEditForm.vue', () => {
  it('should render component', () => {
    const wrapper = mount(ProfileEditForm, {
      props: {
        form: {
          username: '',
          display_name: '',
          bio: '',
          favorite_anime_id: '',
          favorite_manga_id: '',
          location: '',
          website: '',
          twitter: '',
          instagram: '',
          discord: '',
        },
        animeList: [],
        mangaList: [],
      },
      global: {
        stubs: {
          Input: true,
          Label: true,
          Textarea: true,
          AppSelect: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
