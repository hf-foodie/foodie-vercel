import Footer from '@/components/krds/Footer'
import Header from '@/components/Header/Header'
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation'
import Banner from '@/shared/banner'
import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
  headerHasBorder?: boolean
  showBanner?: boolean
}

const ApplicationLayout: React.FC<Props> = async ({
  children,
  headerHasBorder,
  showBanner = false,
}) => {

  return (
    <>
      <a className="kr-skip" href="#main-content">본문 바로가기</a>
      {showBanner && <Banner />}
      {<Header bottomBorder={headerHasBorder} />}

      <div id="main-content" tabIndex={-1}>{children}</div>
         <Footer />
      <AsideSidebarNavigation />
    </>
  )
}

export { ApplicationLayout }
