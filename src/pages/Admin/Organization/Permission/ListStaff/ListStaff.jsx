
import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { btnClickTabListInvoicePrintSelector } from '../../../../../redux/selector';
import { fetchAddRole, fetchRemoveRole, fetchUserRole } from '../../../../../redux/slices/permissionSlice/permissionSlice'
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Input, Space, Table, Button, Row, Col } from 'antd';
import { useQuery } from "@apollo/client";
import { GetUserAccount } from '../../../../../graphql/ManagerClaims/getUserAccounts';
import { getRequest } from '../../../../../services';

const ListStaff = () => {
   const dispatch = useDispatch();
   const rowSelection = useSelector(btnClickTabListInvoicePrintSelector);
   const listStaff = useSelector(state => state.permissionSlice.staffData)
   const listRoleId = useSelector(state => state.permissionSlice.listRoleId)

   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const searchInput = useRef(null);
   const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };
   const handleReset = (clearFilters) => {
      clearFilters();
      setSearchText('');
   };
   const getColumnSearchProps = (dataIndex) => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
         <div
            style={{
               padding: 8,
            }}
            onKeyDown={(e) => e.stopPropagation()}
         >
            <Input
               ref={searchInput}
               placeholder={`Search ${dataIndex}`}
               value={selectedKeys[0]}
               onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
               onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
               style={{
                  marginBottom: 8,
                  display: 'block',
               }}
            />
            <Space>
               <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{
                     width: 90,
                  }}
               >
                  Tìm
               </Button>
               <Button
                  onClick={() => clearFilters && handleReset(clearFilters)}
                  size="small"
                  style={{
                     width: 90,
                  }}
               >
                  Khôi phục
               </Button>
               <Row>
                  <Col
                     xs={{ span: 0 }}
                     sm={{ span: 0 }}
                     md={{ span: 0 }}
                     lg={{ span: 24 }}
                  >
                     <Button
                        type="link"
                        size="small"
                        onClick={() => {
                           confirm({
                              closeDropdown: false,
                           });
                           setSearchText(selectedKeys[0]);
                           setSearchedColumn(dataIndex);
                        }}
                     >
                        Lọc
                     </Button>
                     <Button
                        type="link"
                        size="small"
                        onClick={() => {
                           close();
                        }}
                     >
                        Đóng
                     </Button>
                  </Col>
               </Row>
            </Space>
         </div>
      ),
      filterIcon: (filtered) => (
         <SearchOutlined
            style={{
               color: filtered ? '#1677ff' : undefined,
            }}
         />
      ),
      onFilter: (value, record) =>
         record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownOpenChange: (visible) => {
         if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
         }
      },
      render: (text) =>
         searchedColumn === dataIndex ? (
            <Highlighter
               highlightStyle={{
                  backgroundColor: '#ffc069',
                  padding: 0,
               }}
               searchWords={[searchText]}
               autoEscape
               textToHighlight={text ? text.toString() : ''}
            />
         ) : (
            text
         ),
   });
   const columns = [
      {
         title: 'STT',
         dataIndex: 'stt',
         key: 'stt',
         width: '8%',
      },
      {
         title: 'Tên',
         dataIndex: 'userName',
         key: 'userName',
         ...getColumnSearchProps('userName'),
         width: '25%',
      },
      {
         title: 'Email',
         dataIndex: 'email',
         key: 'email',
         ...getColumnSearchProps('email'),
         width: '40%',
      },
      {
         title: 'Hành động',
         dataIndex: 'action',
         key: 'action',
         width: '18%',
         sorter: (a, b) => a.action === b.action ? 0 : a.action ? -1 : 1,
         sortDirections: ['descend', 'ascend'],
         defaultSortOrder: 'ascend',
         showSorterTooltip: false,
         render: (text, record) => {
            return (
               text ?
                  (<Button
                     danger
                     style={{
                        height: '20px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '0px 14px',
                     }}
                     onClick={() => handleRemoveRole(record.id)}
                  >Xoá</Button>) :
                  <Button
                     style={{
                        height: '20px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '0px 10px',
                     }}
                     type="primary"
                     onClick={() => handleAddRole(record.id)}
                  >Thêm</Button>
            )
         },
      }
   ];

   const handleAddRole = (userId) => {
      dispatch(fetchAddRole({ userId, roleName: rowSelection?.name, roleId: rowSelection?.id }))
   }

   const handleRemoveRole = (userId) => {
      dispatch(fetchRemoveRole({ userId, roleName: rowSelection?.name, roleId: rowSelection?.id }))
   }

   const data = listStaff.map((item, index) => ({
      ...item,
      stt: index + 1,
      action: listRoleId.findIndex(el => el?.userId === item?.id) !== -1 ? true : false
   }))

   return (
      <>
         <Row style={{ marginBottom: 4 }}>
            <h4 className='actions-title'>Danh sách nhân viên</h4>
         </Row>

         {
            rowSelection ?
               <Table columns={columns} dataSource={data} scroll={{ x: 600, y: 615.5 }}
                  bordered
                  size="small"
                  rowKey="stt"
               /> :
               <p style={{ textAlign: 'center' }}>Vui lòng chọn nhóm quyền...</p>
         }
      </>
   )
}

export default ListStaff