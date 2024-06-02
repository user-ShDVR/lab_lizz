import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

const CharacteristicsInput = () => {
  return (
    <Form.List name="characteristics">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item
                {...restField}
                name={[name, 'name']}
                rules={[{ required: true, message: 'Введите характеристику' }]}
              >
                <Input placeholder="Наименование характеристики" />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'value']}
                rules={[{ required: true, message: 'Введите значение' }]}
              >
                <Input placeholder="Значение характеристики" />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'rowKey']}
                hidden
                initialValue={uuidv4()}
              >
                <Input />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
              Добавить характеристику
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default CharacteristicsInput;
