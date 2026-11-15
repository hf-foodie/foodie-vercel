import Aside from '@/components/aside'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Aside.Provider>{children}</Aside.Provider>
    </div>
  )
}

export default Layout
