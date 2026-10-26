import type { FC, PropsWithChildren, ReactNode } from 'react';

import { AffineOtherPageLayout } from '../affine-other-page-layout';
import { BrandLogo } from '../brand-logo';
import {
  authPageContainer,
  hideInSmallScreen,
  illustration,
} from './share.css';

export const AuthPageContainer: FC<
  PropsWithChildren<{
    title?: ReactNode;
    subtitle?: ReactNode;
  }>
> = ({ children, title, subtitle }) => {
  return (
    <AffineOtherPageLayout>
      <div className={authPageContainer}>
        <div className="wrapper">
          <div className="content">
            <p className="title">{title}</p>
            <div className="subtitle">{subtitle}</div>
            {children}
          </div>
          <div className={hideInSmallScreen}>
            <BrandLogo className={illustration} width={220} height={220} />
          </div>
        </div>
      </div>
    </AffineOtherPageLayout>
  );
};
