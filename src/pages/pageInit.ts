import '../styles/main.css';
import { mountSiteChrome, type PageId } from '../components/layout';

export function initStaticPage(pageId: PageId): void {
  mountSiteChrome(pageId);
}
