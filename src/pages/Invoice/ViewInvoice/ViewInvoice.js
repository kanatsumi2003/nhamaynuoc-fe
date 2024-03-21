import { Button, Col, Modal, Row, Select } from "antd";
import { PrinterOutlined, SaveOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ViewInvoice.css";
import { useEffect, useRef, useState } from "react";
import { convertToWords } from "./NumberToWords";
import { useReactToPrint } from "react-to-print";
import ExportExcel from "./ExportInvoiceAsXLS";

import { exportComponentAsPNG } from "react-component-export-image";
import {
  btnClickGetFactoryIdSelector,
  btnClickGetViewInvoiceListSelector,
  fetchDataByNhaMay,
  getInvoiceList,
  getViewInvoiceDetail,
} from "../../../redux/selector";
import { useDispatch, useSelector } from "react-redux";
import { primaryLogo } from "../../../asset/images";
import dayjs from "dayjs";
import { fetchDataByFactory } from "../../../redux/slices/factorySlice/factorySlice";

const data = {
  Inumber: "0068105",
  CustomerName: "Phạm Trung Hiếu",
  CustomerAddress: "Bảo Vinh - Bảo Hà - Bảo Yên - Lào",
  CustomerCode: "LCI00168",
  CustomerPhone: "0973376861",
  Route: "baovinh",
  NewNumber: 331,
  OldNumber: 290,
  Price: [
    {
      id: 1,
      value: 6.268,
    },
    {
      id: 2,
      value: 8.417,
    },
    {
      id: 3,
      value: 12.537,
    },
    {
      id: 4,
      value: 16.119,
    },
  ],
};

// const renderTable = (viewDataDetail) => {


//   var number = data.NewNumber - data.OldNumber + 10; // 10 là số bù lại cho code bên dưới
//   console.log("Data:", viewDataDetail.chiTietHoaDonRespondModels);
//   number -= 10;
//   return (
//     <>
//       <tr>
//         <td style={{ ...style, borderBottom: "0px", borderTop: "0px" }}>
//           {viewDataDetail.tieuThu}
//         </td>
//         {viewDataDetail.tongTienTruocVat && viewDataDetail.tieuThu && (
//           <td style={{ ...style, borderBottom: "0px", borderTop: "0px" }}>
//             {(viewDataDetail.tongTienTruocVat / viewDataDetail.tieuThu)
//               .toFixed(0)
//               .toLocaleString()}
//           </td>
//         )}

//         {viewDataDetail.tongTienTruocVat && (
//           <td style={{ ...style, borderBottom: "0px", borderTop: "0px" }}>
//             {viewDataDetail.tongTienTruocVat.toLocaleString()}
//           </td>
//         )}
//       </tr>
//     </>
//   );
// };

const renderTable = (viewDataDetail) => {
  if (!viewDataDetail || !viewDataDetail?.chiTietHoaDonRespondModels) {
    return (
      <>
        <tr>
          <td style={{ ...style, borderBottom: "0px", borderTop: "0px" }}></td>
          <td style={{ ...style, borderBottom: "0px", borderTop: "0px" }}></td>
          <td style={{ ...style, borderBottom: "0px", borderTop: "0px" }}></td>
        </tr>
      </>
    );
  }
  var number = data.NewNumber - data.OldNumber + 10; // 10 là số bù lại cho code bên dưới

  return viewDataDetail?.chiTietHoaDonRespondModels.map((item, index) => {
    number -= 10;
    return (
      <>
        <tr key={index}>
          <td style={{ ...style, borderBottom: "0px", borderTop: "0px" }}>
            {item.soTieuThu}
          </td>
          <td style={{ ...style, borderBottom: "0px", borderTop: "0px" }}>
            {item.donGia != null ? item.donGia?.toLocaleString("en-US") : "0"}
          </td>
          <td style={{ ...style, borderBottom: "0px", borderTop: "0px" }}>
            {item.thanhTien != null
              ? item.thanhTien?.toLocaleString("en-US")
              : "0"}
          </td>
        </tr>
      </>
    );
  });
};

const style = {
  fontFamily: "Times New Roman, Times, serif",
  lineHeight: "2.3rem",
};

export const ViewInvoice = (props) => {
  const dispatch = useDispatch()
  const data2 = useSelector(fetchDataByNhaMay)

  console.log(data2);
  const { isOpen, handleCancel } = props;
  // const [total, setTotal] = useState(0);
  const [type, setType] = useState("xls");
  const generatePDF = () => {
    const printInvoice = document.getElementById("print-invoice");
  
    html2canvas(printInvoice).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a5");
      pdf.addImage(imgData, "PNG", 15, 5, 180, 140);
      pdf.save("hoa-don.pdf");
    });
  };

  const handleSelectChange = (value) => {
    setType(value);
    // if (value === "pdf") {
    //   generatePDF();
    // }
  };

  // const viewDataDetail = useSelector(getViewInvoiceDetail);
  // const invoiceListSelector = useSelector(getInvoiceList);
  const dataViewInvoiceList = useSelector(btnClickGetViewInvoiceListSelector);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "hoa-don",
    // onAfterPrint: () => alert('Print success')
  });


  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        handleCancel();
      }}
      width={1100}
    >
      <Row
        style={{
          marginBottom: "1rem",
        }}
      >
        <Col xs={{ span: 7 }} lg={{ span: 2 }}>
          <Button onClick={handlePrint}>
            Print <PrinterOutlined />
          </Button>
        </Col>
        <Col xs={{ span: 7 }} lg={{ span: 2 }}>
          {type === "xls" ? (
            <ExportExcel data={data}>
              <Button>
                Save <SaveOutlined />
              </Button>
            </ExportExcel>
          ) : type === "png" ? (
            <>
              <Button onClick={() => exportComponentAsPNG(componentRef)}>
                Save <SaveOutlined />
              </Button>
            </>
          ) : (
            <>
              <Button onClick={generatePDF}>
                Save <SaveOutlined />
              </Button>
            </>
          )}
        </Col>
        <Col xs={{ span: 5 }} lg={{ span: 2 }}>
          <Select defaultValue={"xls"} onChange={handleSelectChange}>
            <Select.Option value="xls">XLS</Select.Option>
            <Select.Option value="png">PNG</Select.Option>
            <Select.Option value="pdf">PDF</Select.Option>
          </Select>
        </Col>
      </Row>
      <div
        style={{
          overflowY: "scroll",
          height: "65vh",
          maxHeight: "650px",
          border: "1px solid #000",
        }}
      >
        <Row
          style={{
            width: "100%",
          }}
        >
          <div
            ref={componentRef}
            id="print-invoice"
            // style={{
            //   padding: "3rem 0 2rem 4rem",
            // }}
          >
            {dataViewInvoiceList?.map(
              (data) => (
                console.log(data),
                (
                  <div
                    style={{
                      // borderBottom: "1px solid #000",
                      alignContent: "space-between",
                      paddingBottom: "10%",
                    }}
                  >
                    <Row
                      style={{
                        // width: "1000px",
                        paddingTop: "55px",
                      }}
                      key={data && data.id}
                    >
                      <Col span={10} style={{ paddingLeft: "50px" }}>
                        <Row>
                          <Col className="title-invoice" span={24}>
                            <h3 style={style}>CT CP XD VÀ CN MT VIỆT NAM</h3>
                            <h2 style={style}>HÓA ĐƠN TIỀN NƯỚC</h2>
                            <p style={style}>(Liên 1: Lưu)</p>

                                <p style={style}>Kỳ: Từ ngày {data &&
                                    data.ngayDauKy &&
                                    dayjs(data.ngayDauKy).format("DD-MM-YYYY") }</p>
                                <p style={style}>đến ngày {data &&
                                    data.ngayCuoiKy &&
                                    dayjs(data.ngayCuoiKy).format("DD-MM-YYYY") }</p>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24} className="customer-info">
                            <p style={style}>Số hóa đơn: {data?.keyId}</p>

                            <p style={style}>
                              Tên khách hàng: <b>{data?.tenKhachHang}</b>
                            </p>
                            <Row style={style} />
                            <p style={style}>
                              Địa chỉ: <b>{data && data?.diaChi}</b>
                            </p>
                            <p style={style}>
                              Mã số khách hàng: {data && data?.maKhachHang}
                            </p>
                            <p style={style}>Tuyến: {data && data?.tuyenDoc}</p>
                            {/*  */}
                           
                            <Row>
                              <Col span={11}>
                                <p style={style}>CHỈ SỐ MỚI:</p>
                              </Col>
                              <Col span={11} style={{ textAlign: "right" }}>
                                <b style={style}>
                                  {data &&
                                    data.chiSoDongHo &&
                                    data.chiSoDongHo.chiSoMoi}
                                </b>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={11}>
                                <p style={style}>CHỈ SỐ CŨ:</p>
                              </Col>
                              <Col span={11} style={{ textAlign: "right" }}>
                                <b style={style}>
                                  {data &&
                                    data.chiSoDongHo &&
                                    data.chiSoDongHo.chiSoCu}
                                </b>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={11}>
                                <p style={style}>SỐ TIÊU THỤ:</p>
                              </Col>
                              <Col
                                span={11}
                                style={{ textAlign: "right", ...style }}
                              >
                                <b style={style}>{data && data?.tieuThu}</b>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={24}>
                                <p style={style}>Trong đó</p>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={23}>
                                <table className="table-invoice">
                                  <thead>
                                    <tr>
                                      <th
                                        style={{
                                          ...style,
                                          border: "1px solid black",
                                        }}
                                      >
                                        SỐ T.THỤ
                                      </th>
                                      <th
                                        style={{
                                          ...style,
                                          border: "1px solid black",
                                        }}
                                      >
                                        ĐƠN GIÁ
                                      </th>
                                      <th
                                        style={{
                                          ...style,
                                          border: "1px solid black",
                                        }}
                                      >
                                        THÀNH TIỀN
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {renderTable(data)}
                                    {/* <tr className="total">
                                  <td style={style} colSpan={2}>
                                    Phí VAT 5%
                                  </td>
                                  <td style={style} colSpan={1}>
                                    {Math.ceil(item?.phiVat).toLocaleString(
                                      "en-US"
                                    )}
                                  </td>
                                  
                                </tr> */}

                                    <tr className="total">
                                      <td style={style} colSpan={2}>
                                        Phí duy trì
                                      </td>
                                      <td style={style} colSpan={1}></td>
                                    </tr>

                                    <tr className="total">
                                      <td style={style} colSpan={2}>
                                        Phí VAT 5%
                                      </td>
                                      {data?.tongTienTruocVat && (
                                        <td style={style} colSpan={1}>
                                          {data.vat?.toLocaleString("en-US")}
                                        </td>
                                      )}
                                    </tr>

                                    <tr className="total">
                                      <td style={style} colSpan={2}>
                                        Tổng tiền thanh toán
                                      </td>
                                      {data?.tongTienHoaDon && (
                                        <td style={style} colSpan={1}>
                                          {data.tongTienHoaDon?.toLocaleString(
                                            "en-US"
                                          )}
                                        </td>
                                      )}
                                    </tr>
                                  </tbody>
                                </table>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={24}>
                                <b style={style}>
                                  Bằng chữ:{" "}
                                  {convertToWords(
                                    Math.round(data?.tongTienHoaDon)
                                  )}
                                </b>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={24}>
                                <div style={style}>
                                  Thu ngân:{" "}
                                  <b
                                    style={{
                                      color:
                                        data?.trangThaiThanhToan ===
                                        "ChuaThanhToan"
                                          ? "red"
                                          : "green",
                                    }}
                                  >
                                    {data?.trangThaiThanhToan ===
                                    "ChuaThanhToan"
                                      ? "Chưa Thanh Toán"
                                      : "Đã Thanh Toán"}
                                  </b>
                                </div>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                      <Col
                        span={1}
                        style={{
                          borderLeft: "1px dotted #000",
                          marginLeft: "1.5rem",
                        }}
                      />
                      <Col span={12}>
                        <Row>
                          <Col className="title-invoice" span={24}>
                            <h2 style={style}>HÓA ĐƠN TIỀN NƯỚC</h2>
                            <p style={style}>(Liên 2: Giao khách hàng)</p>
                            <p style={style}>Kỳ: Từ ngày {data &&
                                    data.ngayDauKy &&
                                    dayjs(data.ngayDauKy).format("DD-MM-YYYY") }</p>
                                <p style={style}>đến ngày {data &&
                                    data.ngayCuoiKy &&
                                    dayjs(data.ngayCuoiKy).format("DD-MM-YYYY") }</p>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24} className="customer-info">
                            <p style={style}>Số hóa đơn: <span style={{fontWeight:"bold"}}>{data?.keyId}</span></p>
                            <p style={style}>
                              Đơn vị bán hàng:{" "}
                              <b>{data2?.phanLoaiNhaMay}</b>
                            </p>
                            <p style={style}>
                              Địa chỉ: <span style={{fontWeight:"bold"}}>{data2?.congSuatThietKy}</span>
                            </p>
                            <p style={style}>MS thuế: <span style={{fontWeight:"bold"}}>{data2?.maSoThue}</span></p>

                            <p style={style}>
                              Tài khoản: <span style={{fontWeight:"bold"}}> {data2?.taiKhoanNganHang} - {data2?.tenNganHang}</span>
                            </p>
                            <p style={style}>
                              Chủ tài khoản:{" "}
                              <b>
                                {data2?.chuTaiKhoanNganHang}
                              </b>
                            </p>
                            <p style={style}>
                              <b> {data?.tenNhaMay} </b>{" "}
                            </p>
                            <p style={style}>Điện thoại: <span style={{fontWeight:"bold"}}>{data2?.dienThoai}</span></p>
                            <p style={style}>
                              Tên khách hàng:{" "}
                              <b>{data && data?.tenKhachHang}</b>
                            </p>
                            <p style={style}>
                              Địa chỉ: <b>{data?.diaChi}</b>
                            </p>
                            <p style={style}>MST:{data?.maSoThue}</p>
                            <p style={style}>Số tài khoản:{data?.taiKhoanNH}</p>
                            <p style={style}>
                              Mã số khách hàng: {data?.maKhachHang}
                            </p>
                            <p style={style}>
                              Số điện thoại: {data?.dienThoai}
                            </p>
                            <Row />
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <table className="table-invoice">
                              <thead>
                                <tr>
                                  <th
                                    style={{
                                      ...style,
                                      border: "1px solid black",
                                    }}
                                  >
                                    CHỈ SỐ MỚI
                                  </th>
                                  <th
                                    style={{
                                      ...style,
                                      border: "1px solid black",
                                    }}
                                  >
                                    CHỈ SỐ CŨ
                                  </th>
                                  <th
                                    style={{
                                      ...style,
                                      border: "1px solid black",
                                    }}
                                  >
                                    SỐ T.THỤ
                                  </th>
                                  <th
                                    style={{
                                      ...style,
                                      border: "1px solid black",
                                    }}
                                  >
                                    ĐƠN GIÁ
                                  </th>
                                  <th
                                    style={{
                                      ...style,
                                      border: "1px solid black",
                                    }}
                                  >
                                    THÀNH TIỀN
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>
                                    <b style={style}>
                                      {data?.chiSoDongHo?.chiSoMoi}
                                    </b>
                                  </td>
                                  <td>
                                    <b style={style}>
                                      {data?.chiSoDongHo?.chiSoCu}
                                    </b>
                                  </td>
                                  <td
                                    style={{
                                      ...style,
                                      borderBottom: "1px solid black",
                                    }}
                                  >
                                    <b>
                                      {data?.chiSoDongHo?.chiSoMoi -
                                        data?.chiSoDongHo?.chiSoCu}
                                    </b>
                                  </td>
                                  <td
                                    style={{ ...style, borderBottom: "0px" }}
                                  ></td>
                                  <td
                                    style={{ ...style, borderBottom: "0px" }}
                                  ></td>
                                </tr>

                                <tr className="sign">
                                  <td
                                    rowSpan={8}
                                    colSpan={2}
                                    style={{
                                      ...style,
                                      border: "1px solid black",
                                    }}
                                  >
                                    <div style={{ textAlign: "center" }}>
                                      <img
                                        src={primaryLogo.chuKy}
                                        alt="Ảnh chữ ký"
                                        style={{
                                          width: "152px",
                                          height: "80px",
                                        }}
                                      />
                                      <br />
                                      <b>Nguyễn Văn Đoàn</b>
                                    </div>
                                  </td>
                                </tr>

                                {/*  */}
                                {renderTable(data)}

                                <tr className="total">
                                  <td colSpan={2} style={style}>
                                    <b>Phí duy trì</b>
                                  </td>
                                  <td colSpan={1} style={style}></td>
                                </tr>

                                <tr className="total">
                                  <td style={style} colSpan={2}>
                                    <b>Phí VAT 5%</b>
                                  </td>
                                  {data?.tongTienTruocVat && (
                                    <td style={style} colSpan={1}>
                                      <b>
                                        {Math.ceil(data.vat)?.toLocaleString(
                                          "en-US"
                                        )}
                                      </b>
                                    </td>
                                  )}
                                </tr>

                                <tr className="total">
                                  <td colSpan={2} style={style}>
                                    <b>Tổng tiền thanh toán</b>
                                  </td>
                                  {data?.tongTienHoaDon && (
                                    <td colSpan={1} style={style}>
                                      <b>
                                        {data?.tongTienHoaDon?.toLocaleString(
                                          "en-US"
                                        )}
                                      </b>
                                    </td>
                                  )}
                                </tr>
                                <tr />
                                <tr />
                                <tr />
                                {/*  */}
                                <tr>
                                  <td
                                    style={{ textAlign: "center", ...style }}
                                    colSpan={1}
                                  >
                                    Số viết thành chữ
                                  </td>
                                  <td
                                    style={{
                                      textAlign: "left",
                                      paddingLeft: "1rem",
                                      ...style,
                                    }}
                                    colSpan={4}
                                  >
                                    {convertToWords(
                                      Math.round(data?.tongTienHoaDon)
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                )
              )
            )}
          </div>
        </Row>
      </div>
    </Modal>
  );
};
