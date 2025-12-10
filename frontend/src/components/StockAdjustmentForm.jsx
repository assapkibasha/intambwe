// src/components/StockAdjustmentForm.jsx
import { Form, Button, Select, Input, InputNumber, Space, Spin } from 'antd';

const StockAdjustmentForm = ({ items, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit({
      ...values,
      quantity: parseInt(values.quantity),
    });
    form.resetFields();
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="item_id"
          label="Item"
          rules={[{ required: true, message: 'Please select an item' }]}
        >
          <Select placeholder="Select item">
            {items?.map(item => (
              <Select.Option key={item.item_id} value={item.item_id}>
                {item.name} (Current: {item.quantity})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="adjustment_type"
          label="Adjustment Type"
          rules={[{ required: true, message: 'Please select adjustment type' }]}
        >
          <Select placeholder="Select type">
            <Select.Option value="damaged">Damaged</Select.Option>
            <Select.Option value="lost">Lost</Select.Option>
            <Select.Option value="expired">Expired</Select.Option>
            <Select.Option value="return">Return</Select.Option>
            <Select.Option value="correction">Correction</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true, message: 'Quantity is required' }]}
        >
          <InputNumber min={1} placeholder="0" />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Reason"
        >
          <Input.TextArea rows={3} placeholder="Reason for adjustment" />
        </Form.Item>

        <Form.Item
          name="reference_number"
          label="Reference Number"
        >
          <Input placeholder="Ref. number (e.g., DR-001)" />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Record Adjustment
          </Button>
          <Button>Cancel</Button>
        </Space>
      </Form>
    </Spin>
  );
};

export default StockAdjustmentForm;
