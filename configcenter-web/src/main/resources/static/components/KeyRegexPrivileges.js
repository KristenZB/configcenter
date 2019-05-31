// 操作权限管理组件
const KeyRegexPrivilegesTemplate = `
<div>
    <div v-for="appPrivilege in appPrivileges" style="margin-bottom: 30px">
        <el-row v-if="appPrivilege.app.appId === appId" style="margin-bottom: 10px">
            <el-col :offset="4" :span="16" style="text-align: center;">
                <span style="font-size: x-large;color: #409EFF;">{{ toShowingApp(appPrivilege.app) }}</span>
            </el-col>
            <el-col :span="4" style="text-align: end;">
                <el-button type="primary" icon="el-icon-plus" @click="addKeyRegexPrivilegeVisible = true" size="small">新增</el-button>
            </el-col>
        </el-row>
        <el-row v-else style="margin-bottom: 10px">
            <el-col :offset="4" :span="16" style="text-align: center">
                <span style="font-size: large;color: #67c23a;">{{ toShowingApp(appPrivilege.app) }}</span>
            </el-col>
        </el-row>
        <el-table :data="appPrivilege.showingKeyRegexPrivileges"
                  v-loading="loading"
                  :key="appPrivilege.app.appId"
                  :default-sort="{prop: 'keyRegex'}"
                  :style="{width: appPrivilege.app.appId === appId ? '100%' : 'calc(100% - 130px)'}"
                  :cell-style="{padding: '3px 0px'}"
                  border stripe>
            <el-table-column prop="keyRegex" label="配置key正则表达式" sortable>
                <template slot-scope="{ row }">
                    <span class="keyRegex-text-style">{{ row.keyRegex }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="privilege" label="操作权限" sortable>
                <template slot-scope="{ row }">
                    <div v-if="!row.editing">
                        <el-tag v-if="row.privilege === 'READ_WRITE'" type="success" size="medium">读写</el-tag>
                        <el-tag v-else-if="row.privilege === 'READ'" type="warning" size="medium">只读</el-tag>
                        <el-tag v-else-if="row.privilege === 'NONE'" type="danger" size="medium">无</el-tag>
                    </div>
                    <el-select v-else v-model="row.editingPrivilege" size="mini" placeholder="请选择操作权限" style="width: 90%">
                        <el-option value="READ_WRITE" label="读写"></el-option>
                        <el-option value="READ" label="只读"></el-option>
                        <el-option value="NONE" label="无"></el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column v-if="appPrivilege.app.appId === appId" label="操作" header-align="center" width="130px">
                <template slot-scope="{ row }">
                    <el-row>
                        <el-col :span="16" style="text-align: center">
                            <el-tooltip v-if="!row.editing" content="修改" placement="top" :open-delay="1000" :hide-after="3000">
                                <el-button @click="startEditing(row)" type="primary" icon="el-icon-edit" size="mini" circle></el-button>
                            </el-tooltip>
                            <template v-else>
                                <el-button-group>
                                    <el-tooltip content="取消修改" placement="top" :open-delay="1000" :hide-after="3000">
                                        <el-button @click="row.editing = false" type="info" icon="el-icon-close" size="mini" circle></el-button>
                                    </el-tooltip>
                                    <el-tooltip content="保存修改" placement="top" :open-delay="1000" :hide-after="3000">
                                        <el-button @click="saveEditing(row)" type="success" icon="el-icon-check" size="mini" circle></el-button>
                                    </el-tooltip>
                                </el-button-group>
                            </template>
                        </el-col>
                        <el-col :span="8" style="text-align: center">
                            <el-tooltip content="删除" placement="top" :open-delay="1000" :hide-after="3000">
                                <el-button @click="deletePrivilege(row)" type="danger" icon="el-icon-delete" size="mini" circle></el-button>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <el-dialog :visible.sync="addKeyRegexPrivilegeVisible" :before-close="closeAddKeyRegexPrivilegeDialog" title="新增操作权限" width="60%">
        <el-form ref="addKeyRegexPrivilegeForm" :model="addKeyRegexPrivilegeForm" label-width="30%">
            <el-form-item label="配置key正则表达式" prop="keyRegex" :rules="[{required:true, message:'请输入配置key的正则表达式', trigger:'blur'}]">
                <el-input v-model="addKeyRegexPrivilegeForm.keyRegex" clearable placeholder="请输入配置key的正则表达式" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="操作权限" prop="privilege" :rules="[{required:true, message:'请选择操作权限', trigger:'blur'}]">
                <el-select v-model="addKeyRegexPrivilegeForm.privilege" placeholder="请选择操作权限" style="width: 90%">
                    <el-option value="READ_WRITE" label="读写"></el-option>
                    <el-option value="READ" label="只读"></el-option>
                    <el-option value="NONE" label="无"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer">
            <el-button @click="closeAddKeyRegexPrivilegeDialog">取消</el-button>
            <el-button type="primary" @click="addPrivilege">提交</el-button>
        </div>
    </el-dialog>
</div>
`;

const KeyRegexPrivileges = {
    template: KeyRegexPrivilegesTemplate,
    props: ['appId'],
    data: function () {
        return {
            manager: CURRENT_MANAGER,
            loading: false,
            appPrivileges: [],
            addKeyRegexPrivilegeVisible: false,
            addKeyRegexPrivilegeForm: {
                keyRegex: null,
                privilege: null
            }
        };
    },
    created: function () {
        this.findInheritedPrivileges();
    },
    methods: {
        findInheritedPrivileges: function () {
            this.loading = true;
            const theThis = this;
            axios.get('../manage/keyRegexPrivilege/findInheritedPrivileges', {
                params: {
                    appId: this.appId
                }
            }).then(function (result) {
                theThis.loading = false;
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                result.appPrivileges.forEach(function (appPrivilege) {
                    const showingKeyRegexPrivileges = [];
                    for (let keyRegex in appPrivilege.keyRegexPrivileges) {
                        let privilege = appPrivilege.keyRegexPrivileges[keyRegex];
                        showingKeyRegexPrivileges.push({
                            keyRegex: keyRegex,
                            privilege: privilege,
                            editing: false,
                            editingPrivilege: null
                        });
                    }
                    appPrivilege.showingKeyRegexPrivileges = showingKeyRegexPrivileges;
                });
                theThis.appPrivileges = result.appPrivileges;
            });
        },
        startEditing: function (showingKeyRegexPrivilege) {
            showingKeyRegexPrivilege.editing = true;
            showingKeyRegexPrivilege.editingPrivilege = showingKeyRegexPrivilege.privilege;
        },
        saveEditing: function (showingKeyRegexPrivilege) {
            this.addOrModifyPrivilege(this.appId, showingKeyRegexPrivilege.keyRegex, showingKeyRegexPrivilege.editingPrivilege);
        },
        addPrivilege: function () {
            const theThis = this;
            this.$refs.addKeyRegexPrivilegeForm.validate(function (valid) {
                if (!valid) {
                    return;
                }
                theThis.addOrModifyPrivilege(theThis.appId, theThis.addKeyRegexPrivilegeForm.keyRegex, theThis.addKeyRegexPrivilegeForm.privilege);
            });
        },
        addOrModifyPrivilege: function (appId, keyRegex, privilege) {
            const theThis = this;
            axios.post('../manage/keyRegexPrivilege/addOrModifyPrivilege', {
                appId: appId,
                keyRegex: keyRegex,
                privilege: privilege
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                Vue.prototype.$message.success(result.message);
                theThis.closeAddKeyRegexPrivilegeDialog();
                theThis.findInheritedPrivileges();
            });
        },
        deletePrivilege: function (showingKeyRegexPrivilege) {
            const theThis = this;
            Vue.prototype.$confirm('确定删除？', '警告', {type: 'warning'})
                .then(function () {
                    axios.post('../manage/keyRegexPrivilege/deletePrivilege', {
                        appId: theThis.appId,
                        keyRegex: showingKeyRegexPrivilege.keyRegex
                    }).then(function (result) {
                        if (!result.success) {
                            Vue.prototype.$message.error(result.message);
                            return;
                        }
                        Vue.prototype.$message.success(result.message);
                        theThis.findInheritedPrivileges();
                    });
                });
        },
        closeAddKeyRegexPrivilegeDialog: function () {
            this.addKeyRegexPrivilegeVisible = false;
            this.addKeyRegexPrivilegeForm.keyRegex = null;
            this.addKeyRegexPrivilegeForm.privilege = null;
        },
        toShowingApp: function (app) {
            if (!app) {
                return '';
            }
            let text = app.appId;
            if (app.appName) {
                text += '（' + app.appName + '）';
            }
            return text;
        }
    }
};