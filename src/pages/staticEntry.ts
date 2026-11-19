import type { PageId } from '../components/layout';
import { initStaticPage } from './pageInit';

const pageId = (document.body.dataset.page as PageId | undefined) ?? 'home';
initStaticPage(pageId);
