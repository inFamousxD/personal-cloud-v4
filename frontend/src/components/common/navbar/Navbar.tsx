import React from 'react'
import { NavbarStyled } from './Navbar.styles'
import NavbarItem from './NavbarItem'

export type NavbarPropTypes = {
  data: Array<{
    id: string,
    icon: string
  }>
}

const Navbar: React.FC<NavbarPropTypes> = (props) => {
  const { data } = props;
  return (
    <NavbarStyled>
      {
        data.map((item, index) => {
          return (
            <React.Fragment key={item.id}>
              <NavbarItem data={item} />
              {
                index !== data.length-1 && 
                <div key={item.id + '-' + index} style={{ width: '60%', height: '1px', borderTop: '1px solid white' }}></div>
              }
            </React.Fragment>
          )
        })
      }
    </NavbarStyled>
  )
}

export default Navbar