// src/pages/SupplierManagement.jsx
import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Popconfirm, message, Spin, Modal, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import supplierApi from '../api/supplierApi';
import SupplierForm from '../components/SupplierForm';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await supplierApi.getSuppliers({
        limit: 100,
        q: searchTerm,
      });
      setSuppliers(res.data.data);
    } catch (error) {
      message.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setModalVisible(true);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await supplierApi.deleteSupplier(id);
      message.success('Supplier deleted successfully');
      fetchSuppliers(searchText);
    } catch (error) {
      message.error('Failed to delete supplier');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSupplier) {
        await supplierApi.updateSupplier(editingSupplier.supplier_id, values);
        message.success('Supplier updated successfully');
      } else {
        await supplierApi.createSupplier(values);
        message.success('Supplier created successfully');
      }
      setModalVisible(false);
      fetchSuppliers(searchText);
    } catch (error) {
      message.error('Failed to save supplier');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Contact Person',
      dataIndex: 'contact_person',
      key: 'contact_person',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <span style={{ color: status === 'active' ? 'green' : 'red' }}>{status}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete Supplier"
            description="Are you sure you want to delete this supplier?"
            onConfirm={() => handleDelete(record.supplier_id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '20px' }}>
        <h1>Supplier Management</h1>

        <Card>
          <Space style={{ marginBottom: '20px', width: '100%', justifyContent: 'space-between' }}>
            <Input
              placeholder="Search suppliers..."
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                fetchSuppliers(e.target.value);
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSupplier}>
              Add Supplier
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={suppliers}
            rowKey="supplier_id"
            pagination={{ pageSize: 20 }}
            size="small"
          />
        </Card>

        <Modal
          title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <SupplierForm
            supplier={editingSupplier}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </Modal>
      </div>
    </Spin>
  );
};

export default SupplierManagement;
