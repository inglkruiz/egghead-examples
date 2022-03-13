import { render } from '@testing-library/react';

import SupabaseChatServerUtils from './supabase-chat-server-utils';

describe('SupabaseChatServerUtils', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SupabaseChatServerUtils />);
    expect(baseElement).toBeTruthy();
  });
});
